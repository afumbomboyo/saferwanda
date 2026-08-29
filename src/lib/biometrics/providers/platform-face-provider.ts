
/**
 * @fileOverview SafeRwanda High-Fidelity Facial Registry Provider
 * Handles structured multi-pose frame capture for template registration.
 */

import { FaceProvider, FaceEnrollmentResult } from '../face-provider';

export class PlatformFaceProvider implements FaceProvider {
  id = 'saferwanda_face_v2';
  name = 'SafeRwanda High-Fidelity Facial Registry';

  // Defines the required pose sequence for enrollment
  private static readonly ENROLLMENT_POSES = [
    'Neutral',
    'Turn Left',
    'Turn Right',
    'Look Up',
    'Look Down'
  ];

  async isAvailable(): Promise<boolean> {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async enroll(
    policeId: string, 
    videoElement: HTMLVideoElement, 
    onProgress: (step: number, total: number) => void
  ): Promise<FaceEnrollmentResult> {
    try {
      const poses = PlatformFaceProvider.ENROLLMENT_POSES;
      const totalSteps = poses.length;
      const capturedPayload: Record<string, string> = {};
      
      // Setup a canvas for frame extraction
      const canvas = document.createElement('canvas');
      canvas.width = 640; 
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error("Could not initialize biometric capture context.");
      }

      for (let i = 0; i < totalSteps; i++) {
        // Provide time for the user to adjust to the new pose
        // step is 1-indexed for the progress callback
        onProgress(i + 1, totalSteps);
        
        // Wait for user stability and capture interval
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Extract real frame data
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const frameData = canvas.toDataURL('image/jpeg', 0.9);
        
        // Associate frame with its pose
        capturedPayload[poses[i].toLowerCase().replace(' ', '_')] = frameData;
      }

      // Perform server-side biometric enrollment through the secure bridge
      const response = await fetch('/api/police/face/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policeId,
          payload: capturedPayload,
          poses: poses.map(p => p.toLowerCase().replace(' ', '_')),
          provider: this.id,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Biometric server rejection.");
      }

      return {
        success: true,
        enrollmentId: result.enrollmentId,
        templateId: result.templateId,
        templateVersion: result.templateVersion || 1,
        provider: this.id,
        livenessVerified: result.livenessVerified || true
      };
    } catch (err: any) {
      console.error("Facial enrollment error:", err);
      return {
        success: false,
        livenessVerified: false,
        error: err.message || "Facial capture or verification failed."
      };
    }
  }
}
