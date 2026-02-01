import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

export const useMicrophoneControl = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [isRecordingActive, setIsRecordingActive] = useState(false);

  const requestAudioPermissions = useCallback(async () => {
    setError(null);
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Audio permissions are required.');
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('Failed to request audio permissions:', err);
      setError(`Failed to request audio permissions: ${err.message}`);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    const hasPermission = await requestAudioPermissions();
    if (!hasPermission) return;

    if (recordingRef.current) {
      console.log('Stopping existing recording before starting new one...');
      await stopRecording(false);
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      await recordingRef.current.startAsync();
      setIsRecordingActive(true);
      setIsMuted(false);
      console.log('Recording started');
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setError(`Failed to start recording: ${err.message}`);
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (unloadErr) {
          console.error('Error unloading recording after start failure:', unloadErr);
        }
        recordingRef.current = null;
      }
      setIsRecordingActive(false);
      setIsMuted(true);
    }
  }, [requestAudioPermissions]);

  const stopRecording = useCallback(async (setMutedState = true) => {
    setError(null);
    if (!recordingRef.current) {
      console.log('No active recording to stop.');
      if (setMutedState) setIsMuted(true);
      setIsRecordingActive(false);
      return;
    }

    console.log('Stopping recording...');
    try {
      await recordingRef.current.stopAndUnloadAsync();
      console.log('Recording stopped and unloaded');
    } catch (err: any) {
      console.error('Failed to stop recording:', err);
    } finally {
      recordingRef.current = null;
      setIsRecordingActive(false);
      if (setMutedState) setIsMuted(true);
    }
  }, []);

  const toggleMute = useCallback(async () => {
    if (isMuted) {
      await startRecording();
    } else {
      await stopRecording();
    }
  }, [isMuted, startRecording, stopRecording]);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        console.log('Cleaning up recording on unmount...');
        stopRecording(false);
      }
    };
  }, [stopRecording]);

  const reset = useCallback(() => {
    stopRecording();
    setError(null);
  }, [stopRecording]);

  return {
    isMuted,
    isRecordingActive,
    error,
    toggleMute,
    startRecording,
    stopRecording,
    reset,
  };
};
