import { NextRequest, NextResponse } from 'next/server';
import {
  generateRegistrationOptions,
} from '@simplewebauthn/server';
import { webauthnConfig } from '@/lib/webauthn/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();
    const {
      policeId,
      adminId,
    } = body;

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

    // -----------------------------------------
    // Get officer
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
    // Enrollment status
    // -----------------------------------------
    if (officer?.enrollment?.fingerprint?.enrolled === true) {
      return NextResponse.json(
        { error: 'Fingerprint is already enrolled' },
        { status: 409 }
      );
    }

    // -----------------------------------------
    // Get existing credentials
    // -----------------------------------------
    const credentialsSnapshot = await adminDb
      .collection('webauthn_credentials')
      .where('police_id', '==', policeId)
      .get();

    const excludeCredentials = credentialsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.credential_id,
        transports: data.transports || []
      };
    });

    // -----------------------------------------
    // Generate WebAuthn options
    // -----------------------------------------
    const options = await generateRegistrationOptions({
      rpName: webauthnConfig.rpName,
      rpID: webauthnConfig.rpID,
      userName: `police-${policeId}`,
      userDisplayName: officer?.identity?.full_name || `Police Officer ${policeId}`,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'required',
        userVerification: 'required'
      },
      supportedAlgorithmIDs: [
        -7,
        -257
      ]
    });

    // -----------------------------------------
    // Save challenge
    // -----------------------------------------
    await officerRef.update({
      'enrollment.fingerprint.registration_challenge': options.challenge,
      'enrollment.fingerprint.registration_challenge_created_at': new Date().toISOString()
    });

    return NextResponse.json(options);

  } catch (error: any) {
    console.error('WebAuthn registration options error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Unable to generate WebAuthn registration options'
      },
      { status: 500 }
    );
  }
}
