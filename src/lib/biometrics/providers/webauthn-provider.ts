
/**
 * @fileOverview WebAuthn (Platform Authenticator) Fingerprint Provider
 * Coordinates the server-driven registration ceremony using SimpleWebAuthn.
 */

import { FingerprintProvider, FingerprintProviderCapabilities, EnrollmentResult } from '../fingerprint-provider';
import { startRegistration } from '@simplewebauthn/browser';

export class WebAuthnProvider implements FingerprintProvider {
  id = 'webauthn_platform';
  name = 'Laptop / Platform Biometric (Windows Hello, TouchID)';

  async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) return false;
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

  async enroll(policeId: string, adminId: string): Promise<EnrollmentResult> {
    try {
      // 1. Get registration options from server
      const optionsResponse = await fetch('/api/police/webauthn/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policeId, adminId })
      });

      const options = await optionsResponse.json();
      if (!optionsResponse.ok) {
        throw new Error(options.error || 'Unable to start enrollment ceremony');
      }

      // 2. Start real WebAuthn hardware interaction
      const attestationResponse = await startRegistration({
        optionsJSON: options
      });

      // 3. Send hardware response back to server for verification
      const verifyResponse = await fetch('/api/police/webauthn/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policeId,
          adminId,
          response: attestationResponse
        })
      });

      const result = await verifyResponse.json();
      if (!verifyResponse.ok || !result.verified) {
        throw new Error(result.error || 'Biometric verification failed');
      }

      return {
        success: true,
        enrollmentId: result.credential_id,
        provider: this.id
      };
    } catch (err: any) {
      console.error('WebAuthn enrollment error:', err);
      return {
        success: false,
        error: err.name === 'NotAllowedError' 
          ? 'Enrollment cancelled by user or timed out.' 
          : (err.message || 'Fingerprint enrollment failed')
      };
    }
  }
}
