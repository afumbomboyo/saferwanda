
'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [instances, setInstances] = useState<{ app: FirebaseApp; auth: Auth; db: Firestore } | null>(null);

  useEffect(() => {
    const { app, auth, db } = initializeFirebase();
    setInstances({ app, auth, db });
  }, []);

  if (!instances) return null;

  return (
    <FirebaseProvider app={instances.app} auth={instances.auth} db={instances.db}>
      {children}
    </FirebaseProvider>
  );
}
