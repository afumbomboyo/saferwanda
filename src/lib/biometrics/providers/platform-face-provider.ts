/**
 * @fileOverview SafeRwanda Facial Biometric Provider
 *
 * Handles:
 * 1. Server-generated liveness challenge
 * 2. Liveness frame capture
 * 3. Server-side liveness verification
 * 4. Multi-pose facial enrollment
 */

import { FaceProvider, FaceEnrollmentResult } from '../face-provider';

export class PlatformFaceProvider implements FaceProvider {
  id = 'saferwanda_face_v2';
  name = 'SafeRwanda High-Fidelity Facial Registry';

  private static readonly ENROLLMENT_POSES = [
    'Neutral',
    'Turn Left',
    'Turn Right',
    'Look Up',
    'Look Down',
  ];

  private static readonly LIVENESS_FRAME_COUNT = 8;

  async isAvailable(): Promise<boolean> {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    );
  }

  async enroll(
    policeId: string,
    videoElement: HTMLVideoElement,
    onProgress: (step: number, total: number) => void
  ): Promise<FaceEnrollmentResult> {
    try {
      if (!policeId?.trim()) {
        throw new Error('Police ID is required.');
      }

      if (!videoElement) {
        throw new Error('Camera video is not available.');
      }

      const normalizedPoliceId = policeId.trim();

      /*
       * ---------------------------------------------------------------
       * STEP 1 — Request server-generated liveness challenge
       * ---------------------------------------------------------------
       */

      onProgress(0, 1);

      const challengeResponse = await fetch(
        '/api/police/face/challenge',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            policeId: normalizedPoliceId,
          }),
          cache: 'no-store',
        }
      );

      let challengeResult: any;

      try {
        challengeResult = await challengeResponse.json();
      } catch {
        throw new Error(
          'Invalid response received while creating the liveness challenge.'
        );
      }

      if (
        !challengeResponse.ok ||
        !challengeResult?.success ||
        !challengeResult?.challengeId
      ) {
        throw new Error(
          challengeResult?.error ||
            'Unable to create the liveness challenge.'
        );
      }

      const challengeId = challengeResult.challengeId;

      /*
       * ---------------------------------------------------------------
       * STEP 2 — Capture liveness frames
       *
       * The enrollment dialog will eventually display the challenge
       * instruction. For now, we capture a short sequence of frames
       * while the officer follows that instruction.
       * ---------------------------------------------------------------
       */

      const canvas = document.createElement('canvas');

      canvas.width = 640;
      canvas.height = 480;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error(
          'Could not initialize biometric capture context.'
        );
      }

      const livenessFrames: Blob[] = [];

      for (let i = 0; i < PlatformFaceProvider.LIVENESS_FRAME_COUNT; i++) {
        /*
         * Give the camera time between frames so the captured sequence
         * represents actual movement rather than identical images.
         */
        await new Promise((resolve) =>
          setTimeout(resolve, 400)
        );

        ctx.drawImage(
          videoElement,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(
            (result) => resolve(result),
            'image/jpeg',
            0.9
          );
        });

        if (blob) {
          livenessFrames.push(blob);
        }

        onProgress(
          i + 1,
          PlatformFaceProvider.LIVENESS_FRAME_COUNT
        );
      }

      if (
        livenessFrames.length <
        PlatformFaceProvider.LIVENESS_FRAME_COUNT
      ) {
        throw new Error(
          'Could not capture enough frames for liveness verification.'
        );
      }

      /*
       * ---------------------------------------------------------------
       * STEP 3 — Send liveness frames to the server
       * ---------------------------------------------------------------
       */

      const livenessFormData = new FormData();

      livenessFormData.append(
        'policeId',
        normalizedPoliceId
      );

      livenessFormData.append(
        'challengeId',
        challengeId
      );

      livenessFrames.forEach((frame, index) => {
        livenessFormData.append(
          `frame_${index}`,
          frame,
          `liveness_${index}.jpg`
        );
      });

      const livenessResponse = await fetch(
        '/api/police/face/liveness',
        {
          method: 'POST',
          body: livenessFormData,
          cache: 'no-store',
        }
      );

      let livenessResult: any;

      try {
        livenessResult = await livenessResponse.json();
      } catch {
        throw new Error(
          'Invalid response received from liveness verification.'
        );
      }

      if (
        !livenessResponse.ok ||
        !livenessResult?.success ||
        livenessResult?.livenessVerified !== true
      ) {
        throw new Error(
          livenessResult?.message ||
            livenessResult?.error ||
            'Liveness verification failed. Please try again.'
        );
      }

      /*
       * ---------------------------------------------------------------
       * STEP 4 — Capture the five enrollment poses
       * ---------------------------------------------------------------
       */

      const poses =
        PlatformFaceProvider.ENROLLMENT_POSES;

      const totalSteps = poses.length;

      const capturedPayload: Record<string, string> = {};

      for (let i = 0; i < totalSteps; i++) {
        onProgress(i + 1, totalSteps);

        /*
         * Give the officer time to position their face for the
         * requested enrollment pose.
         */
        await new Promise((resolve) =>
          setTimeout(resolve, 2500)
        );

        ctx.drawImage(
          videoElement,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const frameData =
          canvas.toDataURL('image/jpeg', 0.9);

        const poseKey = poses[i]
          .toLowerCase()
          .replace(/\s+/g, '_');

        capturedPayload[poseKey] = frameData;
      }

      /*
       * ---------------------------------------------------------------
       * STEP 5 — Submit biometric enrollment
       * ---------------------------------------------------------------
       */

      const response = await fetch(
        '/api/police/face/enroll',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            policeId: normalizedPoliceId,
            payload: capturedPayload,
            poses: poses.map((pose) =>
              pose.toLowerCase().replace(/\s+/g, '_')
            ),
            provider: this.id,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      let result: any;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          'Invalid response received from biometric enrollment service.'
        );
      }

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.error ||
            'Biometric enrollment was rejected.'
        );
      }

      /*
       * ---------------------------------------------------------------
       * STEP 6 — Return successful enrollment result
       * ---------------------------------------------------------------
       */

      return {
        success: true,
        enrollmentId: result.enrollmentId,
        templateId:
          result.templateId ||
          result.enrollmentId,
        templateVersion:
          result.templateVersion || 1,
        provider:
          result.provider || this.id,
        livenessVerified: true,
      };
    } catch (err: any) {
      console.error(
        'Facial enrollment error:',
        err
      );

      return {
        success: false,
        livenessVerified: false,
        error:
          err?.message ||
          'Facial capture or verification failed.',
      };
    }
  }
}