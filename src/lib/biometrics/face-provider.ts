/**
 * @fileOverview Facial Biometric Provider Abstraction
 */

export interface FaceEnrollmentResult {
  success: boolean;
  enrollmentId?: string;
  provider?: string;
  livenessVerified: boolean;
  error?: string;
}

export interface FaceProvider {
  id: string;
  name: string;
  isAvailable(): Promise<boolean>;
  enroll(policeId: string, videoElement: HTMLVideoElement, onProgress: (step: number, total: number) => void): Promise<FaceEnrollmentResult>;
}
