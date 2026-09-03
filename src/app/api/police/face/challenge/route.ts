import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Facial Challenge API
 * 
 * Generates a server-side liveness challenge that the officer 
 * must complete (e.g., turn_left, turn_right).
 */

export const dynamic = 'force-dynamic';

const BIOMETRIC_SERVICE_URL = process.env.BIOMETRIC_SERVICE_URL;
const BIOMETRIC_API_KEY = process.env.BIOMETRIC_API_KEY;

export async function POST(request: NextRequest) {
  try {
    // -----------------------------------------------------------------------
    // 1. Validate biometric service configuration
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
    // 2. Read police ID
    // -----------------------------------------------------------------------

    const body = await request.json().catch(() => ({}));

    const policeId =
      typeof body?.policeId === 'string'
        ? body.policeId.trim()
        : '';

    if (!policeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Police ID is required.',
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
    // 4. Request a server-generated liveness challenge
    // -----------------------------------------------------------------------

    const biometricResponse = await fetch(
      `${BIOMETRIC_SERVICE_URL.replace(/\/$/, '')}/v1/face/challenge`,
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${BIOMETRIC_API_KEY}`,
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({ police_id: policeId }),

        cache: 'no-store',
      }
    );

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
    // 5. Handle biometric service failure
    // -----------------------------------------------------------------------

    if (!biometricResponse.ok) {
      console.error(
        'Biometric challenge request failed:',
        biometricResponse.status,
        biometricResult
      );

      return NextResponse.json(
        {
          success: false,
          error:
            biometricResult?.error ||
            'Unable to create liveness challenge.',
        },
        { status: 502 }
      );
    }

    if (
      !biometricResult?.success ||
      !biometricResult?.challenge_id ||
      !biometricResult?.challenge
    ) {
      console.error(
        'Incomplete biometric challenge response:',
        biometricResult
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Biometric service returned an invalid challenge.',
        },
        { status: 502 }
      );
    }

    // -----------------------------------------------------------------------
    // 6. Return challenge to the enrollment UI
    // -----------------------------------------------------------------------

    return NextResponse.json({
      success: true,

      policeId,

      challengeId:
        biometricResult.challenge_id,

      challenge:
        biometricResult.challenge,

      instruction:
        biometricResult.instruction,

      expiresInSeconds:
        biometricResult.expires_in_seconds,
    });

  } catch (error) {
    console.error(
      'Face challenge API error:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to create biometric challenge.',
      },
      { status: 500 }
    );
  }
}