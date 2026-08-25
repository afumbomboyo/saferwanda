
import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { webauthnConfig } from '@/lib/webauthn/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { policeId, adminId } = body;

    if (!policeId) return NextResponse.json({ error: 'Police ID is required' }, { status: 400 });
    if (!adminId) return NextResponse.json({ error: 'Administrator authentication required' }, { status: 401 });

    const { db } = initializeFirebase();
    const officerRef = doc(db, 'police_officers', policeId);
    const officerSnapshot = await getDoc(officerRef);

    if (!officerSnapshot.exists()) {
      return NextResponse.json({ error: 'Police officer not found' }, { status: 404 });
    }

    const officer = officerSnapshot.data();
    if (officer?.enrollment?.fingerprint?.enrolled === true) {
      return NextResponse.json({ error: 'Fingerprint is already enrolled' }, { status: 409 });
    }

    // Get existing credentials to exclude from registration
    const credentialsQuery = query(collection(db, 'webauthn_credentials'), where('police_id', '==', policeId));
    const credentialsSnapshot = await getDocs(credentialsQuery);
    const excludeCredentials = credentialsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.credential_id,
        transports: data.transports || []
      };
    });

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
      supportedAlgorithmIDs: [-7, -257]
    });

    // Store the challenge for verification
    await updateDoc(officerRef, {
      'enrollment.fingerprint.registration_challenge': options.challenge,
      'enrollment.fingerprint.registration_challenge_at': new Date().toISOString()
    });

    return NextResponse.json(options);
  } catch (error: any) {
    console.error('WebAuthn registration options error:', error);
    return NextResponse.json({ error: error.message || 'Unable to generate options' }, { status: 500 });
  }
}
