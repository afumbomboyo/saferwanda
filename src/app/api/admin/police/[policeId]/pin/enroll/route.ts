import { NextRequest, NextResponse } from 'next/server';
import argon2 from 'argon2';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

/**
 * Secure Police PIN Enrollment API
 *
 * Security properties:
 * - Requires a real Firebase authenticated administrator.
 * - Requires administrator authorization.
 * - PIN is validated server-side.
 * - PIN is hashed with Argon2id.
 * - Plain PIN is never stored.
 * - PIN hash is never returned to the browser.
 * - Firestore stores only the credential metadata.
 */

export const dynamic = 'force-dynamic';

const WEAK_PINS = new Set([
  '000000',
  '111111',
  '222222',
  '333333',
  '444444',
  '555555',
  '666666',
  '777777',
  '888888',
  '999999',
  '123456',
  '654321',
]);

export async function POST(
  request: NextRequest,
  { params }: { params: { policeId: string } }
) {
  try {
    // -----------------------------------------------------------------------
    // 1. Validate Firebase administrator authentication
    // -----------------------------------------------------------------------

    const authorization = request.headers.get('authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const idToken = authorization.substring('Bearer '.length).trim();

    if (!idToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Invalid Firebase ID token:', error);

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired authentication token.',
        },
        { status: 401 }
      );
    }

    // -----------------------------------------------------------------------
    // 2. Verify administrator authorization
    // -----------------------------------------------------------------------

    // Check for admin claim or profile status
    const isAdmin =
      decodedToken.admin === true ||
      decodedToken.role === 'admin' ||
      decodedToken.role === 'administrator' ||
      // Fallback: check firestore if claims aren't set yet
      (await (async () => {
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        return userDoc.exists && userDoc.data()?.isAdmin === true;
      })());

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Administrator privileges are required.',
        },
        { status: 403 }
      );
    }

    // -----------------------------------------------------------------------
    // 3. Validate police ID
    // -----------------------------------------------------------------------

    const { policeId } = await params;
    const normalizedPoliceId = policeId?.trim();

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
    // 4. Read request body
    // -----------------------------------------------------------------------

    const body = await request.json();

    const pin =
      typeof body.pin === 'string'
        ? body.pin.trim()
        : '';

    const confirmPin =
      typeof body.confirmPin === 'string'
        ? body.confirmPin.trim()
        : '';

    // -----------------------------------------------------------------------
    // 5. Validate PIN
    // -----------------------------------------------------------------------

    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        {
          success: false,
          error: 'PIN must be exactly 6 digits.',
        },
        { status: 400 }
      );
    }

    if (pin !== confirmPin) {
      return NextResponse.json(
        {
          success: false,
          error: 'PIN confirmation does not match.',
        },
        { status: 400 }
      );
    }

    if (WEAK_PINS.has(pin)) {
      return NextResponse.json(
        {
          success: false,
          error: 'PIN pattern is too weak.',
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------------------------------
    // 6. Verify police officer exists
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
    // 7. Prevent accidental overwrite
    // -----------------------------------------------------------------------

    const officerData = officerSnapshot.data();

    if (officerData?.enrollment?.pin?.configured === true) {
      return NextResponse.json(
        {
          success: false,
          error:
            'A PIN is already enrolled for this police officer. Use the dedicated PIN reset procedure.',
        },
        { status: 409 }
      );
    }

    // -----------------------------------------------------------------------
    // 8. Hash PIN using Argon2id
    // -----------------------------------------------------------------------

    const pinHash = await argon2.hash(pin, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
      hashLength: 32,
    });

    // -----------------------------------------------------------------------
    // 9. Store ONLY the hash and enrollment metadata
    // -----------------------------------------------------------------------

    const enrolledAt = new Date().toISOString();

    await officerRef.update({
      'enrollment.pin': {
        configured: true,
        algorithm: 'argon2id',
        hash: pinHash,
        configured_at: enrolledAt,
        configured_by: decodedToken.uid,
      },
    });

    // -----------------------------------------------------------------------
    // 10. Return safe response
    // -----------------------------------------------------------------------

    return NextResponse.json({
      success: true,
      police_id: normalizedPoliceId,
      pin: {
        configured: true,
        algorithm: 'argon2id',
        configured_at: enrolledAt,
      },
      message: 'Police PIN enrollment completed successfully.',
    });

  } catch (error: any) {
    console.error('PIN enrollment API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal PIN enrollment failure.',
      },
      { status: 500 }
    );
  }
}
