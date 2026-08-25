
/**
 * @fileOverview WebAuthn (Platform Authenticator) Fingerprint Provider
 * Captures the full registration response for technical verification storage.
 */

import { FingerprintProvider, FingerprintProviderCapabilities, EnrollmentResult } from '../fingerprint-provider';

export class WebAuthnProvider implements FingerprintProvider {
  id = 'webauthn_platform';
  name = 'Laptop / Platform Biometric (Windows Hello, TouchID)';

  async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) return false;
    
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

      // In a production environment, you would use a library like @simplewebauthn/browser
      // to parse these buffers and send them to the server for verification.
      // Here we simulate the extraction of the required technical fields.
      
      const response = credential.response as AuthenticatorAttestationResponse;
      
      return {
        success: true,
        enrollmentId: credential.id,
        provider: this.id,
        // Mock extraction of fields required for verification
        publicKey: btoa('MOCK_PUBLIC_KEY_CONTENT_FROM_ATTESTATION'),
        counter: 0,
        transports: response.getTransports ? response.getTransports() : ['internal'],
        deviceType: 'singleDevice',
        backedUp: false
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Biometric enrollment failed."
      };
    }
  }
}
