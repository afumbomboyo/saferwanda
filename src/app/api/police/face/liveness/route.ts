import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Facial Liveness Verification API
 * 
 * Forwards captured frames to the biometric VPS to verify
 * that the user completed the required movement challenge.
 * On success, issues a short-lived authorization for enrollment.
 */

export const dynamic = 'force-dynamic';

const BIOMETRIC_SERVICE_URL = process.env.BIOMETRIC_SERVICE_URL;
const BIOMETRIC_API_KEY = process.env.BIOMETRIC_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // -----------------------------------------------------------------------
    // 1. Validate configuration
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
    // 2. Read multipart request from browser
    // -----------------------------------------------------------------------

    const incomingForm = await request.formData();

    const policeIdValue =
      incomingForm.get('policeId');

    const challengeIdValue =
      incomingForm.get('challengeId');

    if (
      typeof policeIdValue !== 'string' ||
      typeof challengeIdValue !== 'string'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Police ID and challenge ID are required.',
        },
        { status: 400 }
      );
    }

    const policeId = policeIdValue.trim();
    const challengeId = challengeIdValue.trim();

    if (!policeId || !challengeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Police ID and challenge ID are required.',
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------------------------------
    // 3. Verify officer exists
    // -----------------------------------------------------------------------

    const officerRef = adminDb
      .collection('police_officers')
      .doc(policeId);

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
    // 4. Build multipart request for biometric VPS
    // -----------------------------------------------------------------------

    const biometricForm = new FormData();

    // Forward the police_id to the VPS for context-aware analysis
    biometricForm.append(
      'police_id',
      policeId
    );

    biometricForm.append(
      'challenge_id',
      challengeId
    );

    let frameCount = 0;

    for (const [key, value] of incomingForm.entries()) {
      if (!key.startsWith('frame_')) {
        continue;
      }

      if (!(value instanceof File)) {
        continue;
      }

      if (value.size === 0) {
        continue;
      }

      if (value.size > 8 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            error: `Frame ${key} is too large.`,
          },
          { status: 413 }
        );
      }

      biometricForm.append(
        'frames',
        value,
        value.name || `${key}.jpg`
      );

      frameCount++;
    }

    if (frameCount < 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least 5 liveness frames are required.',
          receivedFrames: frameCount,
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------------------------------
    // 5. Send frames to biometric VPS
    // -----------------------------------------------------------------------

    const biometricResponse = await fetch(
      `${BIOMETRIC_SERVICE_URL.replace(/\/$/, '')}/v1/face/liveness`,
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${BIOMETRIC_API_KEY}`,
        },

        body: biometricForm,

        cache: 'no-store',
      }
    );

    // -----------------------------------------------------------------------
    // 6. Read biometric response
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
    // 7. Handle biometric failure
    // -----------------------------------------------------------------------

    if (!biometricResponse.ok) {
      console.error(
        'Biometric liveness request failed:',
        biometricResponse.status,
        biometricResult
      );

      return NextResponse.json(
        {
          success: false,
          error:
            biometricResult?.error ||
            'Liveness verification failed.',
          message:
            biometricResult?.message,
        },
        {
          status:
            biometricResponse.status === 400
              ? 400
              : 502,
        }
      );
    }

    // -----------------------------------------------------------------------
    // 8. On success, issue short-lived enrollment authorization
    // -----------------------------------------------------------------------

    if (biometricResult.liveness_verified === true) {
      const livenessAuthorizationId = crypto.randomUUID();

      await adminDb
        .collection('police_face_liveness')
        .doc(livenessAuthorizationId)
        .set({
          policeId: policeId,
          challengeId,
          verified: true,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 5 * 60 * 1000 // 5 minute validity
          ).toISOString(),
          processing: false,
          used: false,
        });

      return NextResponse.json({
        success: true,
        livenessVerified: true,
        livenessAuthorizationId,
        challengeId,
        policeId: policeId,
        framesReceived:
          biometricResult.frames_received ?? frameCount,
        validFrames:
          biometricResult.valid_frames ?? 0,
        movementScore:
          biometricResult.movement_score ?? null,
      });
    }

    // Handle case where service returned 200 but verified is false
    return NextResponse.json({
      success: false,
      livenessVerified: false,
      error: 'Liveness verification was not successful.',
      challenge: biometricResult.challenge,
      movementScore: biometricResult.movement_score ?? null,
    });

  } catch (error) {
    console.error(
      'Face liveness API error:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        livenessVerified: false,
        error: 'Internal liveness processing failure.',
      },
      { status: 500 }
    );
  }
}