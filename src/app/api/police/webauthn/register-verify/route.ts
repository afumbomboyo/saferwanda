
import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { webauthnConfig } from '@/lib/webauthn/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { policeId, adminId, response } = body;

    if (!policeId || !adminId || !response) {
      return NextResponse.json({ error: 'Incomplete registration data' }, { status: 400 });
    }

    const { db } = initializeFirebase();
    const officerRef = doc(db, 'police_officers', policeId);
    const officerSnapshot = await getDoc(officerRef);

    if (!officerSnapshot.exists()) {
      return NextResponse.json({ error: 'Police officer not found' }, { status: 404 });
    }

    const officer = officerSnapshot.data();
    const expectedChallenge = officer?.enrollment?.fingerprint?.registration_challenge;

    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Registration challenge not found' }, { status: 400 });
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: webauthnConfig.origin,
      expectedRPID: webauthnConfig.rpID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: 'Registration verification failed' }, { status: 400 });
    }

    const { registrationInfo } = verification;
    const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;

    // Store technical credential separately
    const credentialRef = doc(db, 'webauthn_credentials', credential.id);
    await setDoc(credentialRef, {
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

    // Update officer profile status
    await updateDoc(officerRef, {
      'enrollment.fingerprint': {
        credential_id: credential.id,
        enrolled: true,
        enrolled_at: new Date().toISOString(),
        enrolled_by: adminId,
        provider: 'webauthn_platform',
        registration_challenge: null,
        registration_challenge_at: null
      }
    });

    return NextResponse.json({
      success: true,
      verified: true,
      credential_id: credential.id
    });
  } catch (error: any) {
    console.error('WebAuthn verification error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 400 });
  }
}
