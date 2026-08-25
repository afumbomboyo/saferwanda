
/**
 * @fileOverview Fingerprint Biometric Provider Abstraction
 */

export interface FingerprintProviderCapabilities {
  fingerprint: boolean;
  deviceName?: string;
  provider: string;
}

export interface EnrollmentResult {
  success: boolean;
  enrollmentId?: string;
  provider?: string;
  error?: string;
  // Metadata for the registry update
  credential_id?: string;
}

export interface FingerprintProvider {
  id: string;
  name: string;
  isAvailable(): Promise<boolean>;
  getCapabilities(): Promise<FingerprintProviderCapabilities>;
  enroll(policeId: string, adminId: string): Promise<EnrollmentResult>;
}
