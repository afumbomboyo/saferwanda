
/**
 * @fileOverview WebAuthn (Platform Authenticator) Fingerprint Provider
 * Captures the full registration response for technical verification storage.
 */

import { FingerprintProvider, FingerprintProviderCapabilities, EnrollmentResult } from '../fingerprint-provider';

// Static constant for RP ID to ensure cross-subdomain compatibility.
// For production this is saferwanda.io. For development, we allow localhost.
export const WEBAUTHN_RP_ID = typeof window !== 'undefined' ? 
  (window.location.hostname === 'localhost' ? 'localhost' : 'saferwanda.io') : '';

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
          id: WEBAUTHN_RP_ID,
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
        attestation: "direct" // Ensure we get the attestation object
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (!credential) throw new Error("Enrollment cancelled or failed.");

      const response = credential.response as AuthenticatorAttestationResponse;
      
      // Helper to encode ArrayBuffer to Base64 for storage
      const bufferToBase64 = (buffer: ArrayBuffer) => {
        return btoa(String.fromCharCode(...new Uint8Array(buffer)));
      };

      // Extract real technical payloads from the authenticator response
      const attestationObject = bufferToBase64(response.attestationObject);
      const clientDataJSON = bufferToBase64(response.clientDataJSON);
      
      return {
        success: true,
        enrollmentId: credential.id,
        provider: this.id,
        // These are the raw responses that the backend would verify to extract the real public key.
        // For the prototype, we store them as is.
        attestationObject,
        clientDataJSON,
        // In a production verified flow, the public key is extracted from the attestationObject.
        // We set it to the attestationObject string here to signify that we've captured the real key container.
        publicKey: attestationObject, 
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
