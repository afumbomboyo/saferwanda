/**
 * @fileOverview Facial Biometric Provider Abstraction
 */

export interface FaceEnrollmentResult {
  success: boolean;
  enrollmentId?: string;
  templateId?: string;
  templateVersion?: number;
  provider?: string;
  livenessVerified: boolean;
  error?: string;
}

export interface FaceProvider {
  id: string;
  name: string;
  isAvailable(): Promise<boolean>;
  enroll(
    policeId: string, 
    videoElement: HTMLVideoElement, 
    onProgress: (step: number, total: number) => void,
    onLivenessInstruction?: (instruction: string) => void
  ): Promise<FaceEnrollmentResult>;
}
