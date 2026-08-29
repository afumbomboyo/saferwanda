
/**
 * @fileOverview SafeRwanda Real Facial Recognition Provider
 * Handles high-fidelity frame capture and server-side template registration.
 */

import { FaceProvider, FaceEnrollmentResult } from '../face-provider';

export class PlatformFaceProvider implements FaceProvider {
  id = 'saferwanda_face_v1';
  name = 'SafeRwanda High-Fidelity Facial Registry';

  async isAvailable(): Promise<boolean> {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async enroll(
    policeId: string, 
    videoElement: HTMLVideoElement, 
    onProgress: (step: number, total: number) => void
  ): Promise<FaceEnrollmentResult> {
    try {
      const totalSteps = 3;
      const capturedFrames: string[] = [];
      
      // Setup a canvas for frame extraction
      const canvas = document.createElement('canvas');
      canvas.width = 640; // Standardize resolution for biometric processing
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error("Could not initialize biometric capture context.");
      }

      for (let i = 1; i <= totalSteps; i++) {
        // Wait for user stability and capture interval
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Signal progress to UI
        onProgress(i, totalSteps);
        
        // Extract real frame data
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const frameData = canvas.toDataURL('image/jpeg', 0.9);
        capturedFrames.push(frameData);
      }

      // Perform server-side biometric enrollment
      // This sends the real frames to our protected API bridge
      const response = await fetch('/api/police/face/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policeId,
          frames: capturedFrames,
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
