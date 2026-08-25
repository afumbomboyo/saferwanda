import 'server-only';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId:
            process.env.FIREBASE_PROJECT_ID || "studio-4328897811-47b4c",

          clientEmail:
            process.env.FIREBASE_CLIENT_EMAIL,

          privateKey:
            process.env.FIREBASE_PRIVATE_KEY?.replace(
              /\\n/g,
              '\n'
            )
        })
      });

export const adminDb =
  getFirestore(firebaseAdminApp);
