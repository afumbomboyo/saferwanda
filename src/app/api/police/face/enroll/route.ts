import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Secure Facial Enrollment Bridge
 *
 * Browser
 *   ↓
 * Next.js API
 *   ↓ authenticated server-to-server request
 * biometric VPS
 *   ↓
 * encrypted biometric template
 *
 * The biometric API key is NEVER exposed to the browser.
 */

export const dynamic = 'force-dynamic';

const BIOMETRIC_SERVICE_URL = process.env.BIOMETRIC_SERVICE_URL;
const BIOMETRIC_API_KEY = process.env.BIOMETRIC_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // -----------------------------------------------------------------------
    // 1. Validate server configuration
    // -----------------------------------------------------------------------

    if (!BIOMETRIC_SERVICE_URL || !BIOMETRIC_API_KEY) {
      console.error('Biometric service environment variables are missing.');

      return NextResponse.json(
        {
          success: false,
          error: 'Biometric service is not configured.',
        },
        { status: 500 }
      );
    }

    // -----------------------------------------------------------------------
    // 2. Read request from the admin dashboard
    // -----------------------------------------------------------------------

    const body = await request.json();

    const {
      policeId,
      payload,
      poses,
      provider,
      livenessAuthorizationId,
    } = body;

    // -----------------------------------------------------------------------
    // 3. Validate basic request structure
    // -----------------------------------------------------------------------

    if (
      !policeId ||
      typeof policeId !== 'string' ||
      !payload ||
      typeof payload !== 'object'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Incomplete biometric enrollment request.',
        },
        { status: 400 }
      );
    }

    const normalizedPoliceId = policeId.trim();

    if (!normalizedPoliceId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Police ID is required.',
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------------------------------
    // 4. Validate liveness authorization
    // -----------------------------------------------------------------------

    if (
      typeof livenessAuthorizationId !== 'string' ||
      !livenessAuthorizationId.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Successful liveness verification is required before enrollment.',
        },
        { status: 403 }
      );
    }

    const livenessRef = adminDb
      .collection('police_face_liveness')
      .doc(livenessAuthorizationId.trim());

    // Use a transaction to ensure atomic check-and-mark-used
    const authResult = await adminDb.runTransaction(async (transaction) => {
      const livenessSnapshot = await transaction.get(livenessRef);

      if (!livenessSnapshot.exists) {
        return { error: 'Liveness authorization was not found or has expired.' };
      }

      const livenessData = livenessSnapshot.data();

      if (!livenessData) {
        return { error: 'Invalid liveness authorization data.' };
      }

      if (livenessData.verified !== true) {
        return { error: 'Liveness verification was not successful.' };
      }

      if (livenessData.used === true) {
        return { error: 'This liveness authorization has already been used.' };
      }

      if (livenessData.policeId !== normalizedPoliceId) {
        return { error: 'Liveness authorization does not belong to this police officer.' };
      }

      if (
        !livenessData.expiresAt ||
        new Date(livenessData.expiresAt).getTime() <= Date.now()
      ) {
        return { error: 'Liveness authorization has expired.' };
      }

      // Mark as used within the transaction to prevent race conditions
      transaction.update(livenessRef, { 
        used: true, 
        usedAt: new Date().toISOString() 
      });

      return { success: true };
    });

    if (authResult.error) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
        },
        { status: 403 }
      );
    }

    // -----------------------------------------------------------------------
    // 5. Verify that the police officer exists
    // -----------------------------------------------------------------------

    const officerRef = adminDb
      .collection('police_officers')
      .doc(normalizedPoliceId);

    const officerSnapshot = await officerRef.get();

    if (!officerSnapshot.exists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Police officer not found.',
        },
        { status: 404 }
      );
    }

    // -----------------------------------------------------------------------
    // 6. Select the enrollment image
    // -----------------------------------------------------------------------

    const enrollmentImage = payload.neutral;

    if (
      typeof enrollmentImage !== 'string' ||
      !enrollmentImage.startsWith('data:image/')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'A valid neutral enrollment image is required.',
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------------------------------
    // 7. Convert data URL → binary image
    // -----------------------------------------------------------------------

    const imageParts = enrollmentImage.split(',');

    if (imageParts.length !== 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid enrollment image format.',
        },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(imageParts[1], 'base64');

    if (imageBuffer.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Enrollment image is empty.',
        },
        { status: 400 }
      );
    }

    const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'Enrollment image is too large.',
        },
        { status: 413 }
      );
    }

    // -----------------------------------------------------------------------
    // 8. Send image to biometric VPS
    // -----------------------------------------------------------------------

    const formData = new FormData();

    formData.append(
      'police_id',
      normalizedPoliceId
    );

    const imageBlob = new Blob(
      [imageBuffer],
      { type: 'image/jpeg' }
    );

    formData.append(
      'image',
      imageBlob,
      `${normalizedPoliceId}-enrollment.jpg`
    );

    const biometricResponse = await fetch(
      `${BIOMETRIC_SERVICE_URL.replace(/\/$/, '')}/v1/face/enroll`,
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${BIOMETRIC_API_KEY}`,
        },

        body: formData,

        cache: 'no-store',
      }
    );

    // -----------------------------------------------------------------------
    // 9. Read biometric server response
    // -----------------------------------------------------------------------

    let biometricResult: any;

    try {
      biometricResult = await biometricResponse.json();
    } catch {
      biometricResult = {
        success: false,
        error: 'Invalid response from biometric service.',
      };
    }

    // -----------------------------------------------------------------------
    // 10. Forward biometric failure
    // -----------------------------------------------------------------------

    if (!biometricResponse.ok) {
      console.error(
        'Biometric enrollment rejected:',
        biometricResponse.status,
        biometricResult
      );

      return NextResponse.json(
        {
          success: false,
          error:
            biometricResult?.error ||
            'Biometric enrollment was rejected.',
          biometricStatus: biometricResponse.status,
        },
        {
          status:
            biometricResponse.status >= 400 &&
            biometricResponse.status < 600
              ? biometricResponse.status
              : 502,
        }
      );
    }

    // -----------------------------------------------------------------------
    // 11. Verify that the biometric service actually enrolled the face
    // -----------------------------------------------------------------------

    if (
      !biometricResult?.success ||
      !biometricResult?.enrollment_id
    ) {
      console.error(
        'Biometric service returned an incomplete enrollment response:',
        biometricResult
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Biometric service returned an incomplete enrollment result.',
        },
        { status: 502 }
      );
    }

    // -----------------------------------------------------------------------
    // 12. Store enrollment metadata in Firestore
    // -----------------------------------------------------------------------

    await officerRef.update({
      'enrollment.face': {
        enrolled: true,
        enrollment_id: biometricResult.enrollment_id,
        provider:
          biometricResult.provider ||
          provider ||
          'insightface_buffalo_l',
        enrolled_at:
          biometricResult.created_at ||
          new Date().toISOString(),
        liveness_verified: true, // Known true because authorization check passed
        quality: biometricResult.quality || null,
      },
    });

    // -----------------------------------------------------------------------
    // 13. Return real enrollment result to browser
    // -----------------------------------------------------------------------

    return NextResponse.json({
      success: true,

      enrollmentId:
        biometricResult.enrollment_id,

      templateId:
        biometricResult.enrollment_id,

      templateVersion: 1,

      provider:
        biometricResult.provider ||
        provider ||
        'insightface_buffalo_l',

      livenessVerified: true,

      quality:
        biometricResult.quality || null,

      policeId:
        normalizedPoliceId,

      message:
        biometricResult.message ||
        'Face enrollment completed successfully.',
    });

  } catch (error) {
    console.error(
      'API Face Enroll Error:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Internal biometric processing failure.',
      },
      { status: 500 }
    );
  }
}
