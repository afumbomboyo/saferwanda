
/**
 * @fileOverview USB SDK Integration Boundary Placeholder
 */

import { FingerprintProvider, FingerprintProviderCapabilities, EnrollmentResult } from '../fingerprint-provider';

export class USBScannerProvider implements FingerprintProvider {
  id = 'usb_external_sdk';
  name = 'External USB Fingerprint Scanner';

  async isAvailable(): Promise<boolean> {
    return false; 
  }

  async getCapabilities(): Promise<FingerprintProviderCapabilities> {
    return {
      fingerprint: false,
      provider: 'USB-SDK',
      deviceName: 'External Hardware'
    };
  }

  async enroll(policeId: string, adminId: string): Promise<EnrollmentResult> {
    return {
      success: false,
      error: "USB Scanner SDK initialization failed. Hardware not detected."
    };
  }
}
