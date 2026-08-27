import { NextRequest, NextResponse } from 'next/server';
import {
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { webauthnConfig } from '@/lib/webauthn/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();
    const {
      policeId,
      adminId,
      response
    } = body;

    // -----------------------------------------
    // Basic validation
    // -----------------------------------------
    if (!policeId) {
      return NextResponse.json(
        { error: 'Police ID is required' },
        { status: 400 }
      );
    }

    if (!adminId) {
      return NextResponse.json(
        { error: 'Administrator authentication required' },
        { status: 401 }
      );
    }

    if (!response) {
      return NextResponse.json(
        { error: 'WebAuthn response is required' },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Officer
    // -----------------------------------------
    const officerRef = adminDb.collection('police_officers').doc(policeId);
    const officerSnapshot = await officerRef.get();

    if (!officerSnapshot.exists) {
      return NextResponse.json(
        { error: 'Police officer not found' },
        { status: 404 }
      );
    }

    const officer = officerSnapshot.data();

    // -----------------------------------------
    // Retrieve server challenge
    // -----------------------------------------
    const expectedChallenge = officer?.enrollment?.fingerprint?.registration_challenge;

    if (!expectedChallenge) {
      return NextResponse.json(
        { error: 'WebAuthn registration challenge not found' },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Verify registration
    // -----------------------------------------
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: webauthnConfig.origin,
      expectedRPID: webauthnConfig.rpID,
      requireUserVerification: true
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'WebAuthn registration verification failed' },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Extract credential
    // -----------------------------------------
    const { registrationInfo } = verification;

    if (!registrationInfo) {
      return NextResponse.json(
        { error: 'WebAuthn registration information missing' },
        { status: 400 }
      );
    }

    const {
      credential,
      credentialDeviceType,
      credentialBackedUp
    } = registrationInfo;

    // -----------------------------------------
    // Store credential
    // -----------------------------------------
    const credentialRef = adminDb.collection('webauthn_credentials').doc(credential.id);

    await credentialRef.set({
      credential_id: credential.id,
      police_id: policeId,
      public_key: Buffer.from(credential.publicKey).toString('base64'),
      counter: credential.counter,
      transports: credential.transports || [],
      device_type: credentialDeviceType,
      backed_up: credentialBackedUp,
      rp_id: webauthnConfig.rpID,
      provider: 'webauthn_platform',
      created_at: new Date().toISOString(),
      last_used_at: null
    });

    // -----------------------------------------
    // Update officer
    // -----------------------------------------
    await officerRef.update({
      'enrollment.fingerprint': {
        credential_id: credential.id,
        enrolled: true,
        enrolled_at: new Date().toISOString(),
        enrolled_by: adminId,
        provider: 'webauthn_platform',
        registration_challenge: null,
        registration_challenge_created_at: null
      }
    });

    return NextResponse.json({
      success: true,
      verified: true,
      police_id: policeId,
      credential_id: credential.id,
      provider: 'webauthn_platform'
    });

  } catch (error: any) {
    console.error('WebAuthn registration verification error:', error);
    return NextResponse.json(
      {
        error: error.message || 'WebAuthn registration verification failed'
      },
      { status: 400 }
    );
  }
}
