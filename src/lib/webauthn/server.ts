/**
 * @fileOverview WebAuthn Server Utilities
 * Configures RP metadata and provides core verification functions.
 */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';

export const webauthnConfig = {
  rpName: process.env.WEBAUTHN_RP_NAME || 'SafeRwanda Security',
  // Default to studio environment ID if env var is missing to avoid build crashes
  rpID: process.env.WEBAUTHN_RP_ID || '6000-firebase-studio-1781599696400.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev',
  origin: process.env.WEBAUTHN_ORIGIN || 'https://6000-firebase-studio-1781599696400.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev',
};

export {
  generateRegistrationOptions,
  verifyRegistrationResponse,
};
