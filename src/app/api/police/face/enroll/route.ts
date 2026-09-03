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
    // 4. Verify that the police officer exists
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
    // 5. Select the enrollment image
    //
    // For the current PlatformFaceProvider, the captured payload contains:
    //
    // neutral
    // turn_left
    // turn_right
    // look_up
    // look_down
    //
    // For this first backend integration, use the neutral frame as the
    // biometric enrollment image.
    //
    // Real liveness will be integrated into the capture flow in the next
    // step.
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
    // 6. Convert data URL → binary image
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

    // Prevent unexpectedly large requests.
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
    // 7. Build multipart request for biometric VPS
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

    // -----------------------------------------------------------------------
    // 8. Send image to biometric VPS
    // -----------------------------------------------------------------------

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
    //
    // IMPORTANT:
    // The face embedding/template itself remains on the biometric VPS.
    // Firestore stores only enrollment metadata.
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
        liveness_verified:
          biometricResult.liveness_verified === true,
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

      livenessVerified:
        biometricResult.liveness_verified === true,

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