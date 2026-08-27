import 'server-only';

import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Initializes the Firebase Admin SDK.
 * Handles missing environment variables gracefully during the build process.
 */
function getAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || "studio-4328897811-47b4c";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  // Only initialize with a service account if we have all the parts.
  // This prevents crashes during 'next build' when env vars might be missing.
  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      })
    });
  }

  // Fallback for build-time module evaluation
  return initializeApp({ projectId });
}

const firebaseAdminApp = getAdminApp();

export const adminDb = getFirestore(firebaseAdminApp);
