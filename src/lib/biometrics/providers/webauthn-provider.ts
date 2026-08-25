
/**
 * @fileOverview WebAuthn (Platform Authenticator) Fingerprint Provider
 */

import { FingerprintProvider, FingerprintProviderCapabilities, EnrollmentResult } from '../fingerprint-provider';

export class WebAuthnProvider implements FingerprintProvider {
  id = 'webauthn_platform';
  name = 'Laptop / Platform Biometric (Windows Hello, TouchID)';

  async isAvailable(): Promise<boolean> {
    if (!window.PublicKeyCredential) return false;
    
    // Check if platform authenticator is available (Windows Hello, TouchID, Android Biometric)
    return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }

  async getCapabilities(): Promise<FingerprintProviderCapabilities> {
    const available = await this.isAvailable();
    return {
      fingerprint: available,
      provider: 'WebAuthn',
      deviceName: 'System Platform Authenticator'
    };
  }

  async enroll(policeId: string): Promise<EnrollmentResult> {
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userID = Uint8Array.from(policeId, c => c.charCodeAt(0));

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "SafeRwanda Security",
          id: window.location.hostname,
        },
        user: {
          id: userID,
          name: `police-${policeId}`,
          displayName: `Police Officer ${policeId}`,
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "required"
        },
        timeout: 60000,
        attestation: "direct"
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (!credential) throw new Error("Enrollment cancelled or failed.");

      return {
        success: true,
        enrollmentId: credential.id,
        provider: this.id
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Biometric enrollment failed."
      };
    }
  }
}
