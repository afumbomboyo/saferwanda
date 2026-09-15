
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { policeId: string } }
) {
  try {
    // 1. Validate administrator authentication
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const idToken = authorization.substring('Bearer '.length).trim();
    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired authentication token.' },
        { status: 401 }
      );
    }

    // 2. Verify administrator authorization
    const isAdmin =
      decodedToken.admin === true ||
      decodedToken.role === 'admin' ||
      decodedToken.role === 'administrator' ||
      (await (async () => {
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        return userDoc.exists && userDoc.data()?.isAdmin === true;
      })());

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Administrator privileges are required.' },
        { status: 403 }
      );
    }

    // 3. Perform atomic PIN reset
    const { policeId } = await params;
    const normalizedPoliceId = policeId?.trim();
    if (!normalizedPoliceId) {
      return NextResponse.json(
        { success: false, error: 'Police ID is required.' },
        { status: 400 }
      );
    }

    const officerRef = adminDb.collection('police_officers').doc(normalizedPoliceId);
    const officerSnapshot = await officerRef.get();

    if (!officerSnapshot.exists) {
      return NextResponse.json(
        { success: false, error: 'Police officer not found.' },
        { status: 404 }
      );
    }

    // Reset only the PIN credential and related metadata
    await officerRef.update({
      'enrollment.pin': {
        configured: false,
      },
      'enrollment.completed': false,
      // If PIN is removed, the officer status might need to revert if it was active or ready
      status: 'pending_enrollment',
      updated_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Police PIN enrollment has been reset.',
    });

  } catch (error: any) {
    console.error('PIN reset API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal PIN reset failure.' },
      { status: 500 }
    );
  }
}
