/**
 * useImageAnalysis - AI-powered property image analysis hook
 * 
 * Handles image picking, uploading to Convex storage, and AI analysis
 * Uses the analyzeProperty and summarizeProperty Convex actions
 */

import { useState, useCallback } from 'react';
import { useAction } from 'convex/react';
import { api } from '@haus/backend';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useUpload } from './useUpload';

export interface PropertyAnalysis {
  propertyType: 'house' | 'apartment' | 'townhouse' | 'unit' | 'land';
  estimatedBedrooms: number;
  estimatedBathrooms: number;
  features: string[];
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'needs-renovation';
  architecturalStyle?: string;
  outdoorFeatures: string[];
  priceRangeAUD: {
    min: number;
    max: number;
  };
  marketingDescription: string;
  keySellingPoints: string[];
}

export interface PropertySummary {
  summary: string;
  details: string[];
}

export interface AnalysisState {
  isPicking: boolean;
  isUploading: boolean;
  isAnalyzing: boolean;
  analysis: PropertyAnalysis | null;
  summary: PropertySummary | null;
  error: Error | null;
  selectedImage: string | null;
}

export interface UseImageAnalysisReturn extends AnalysisState {
  pickImage: () => Promise<void>;
  takePhoto: () => Promise<void>;
  analyzeImage: (imageUri: string, additionalContext?: string) => Promise<PropertyAnalysis>;
  summarizeImage: (imageUri: string) => Promise<PropertySummary>;
  analyzeAndUpload: (options?: { propertyId?: string; roomId?: string }) => Promise<void>;
  reset: () => void;
  clearImage: () => void;
}

/**
 * Hook for AI-powered property image analysis
 */
export function useImageAnalysis(): UseImageAnalysisReturn {
  const [state, setState] = useState<AnalysisState>({
    isPicking: false,
    isUploading: false,
    isAnalyzing: false,
    analysis: null,
    summary: null,
    error: null,
    selectedImage: null,
  });

  const { uploadImage, isUploading: isUploadingFile } = useUpload();
  
  // Convex AI actions
  const analyzePropertyAction = useAction(api.ai.analyzeProperty);
  const summarizePropertyAction = useAction(api.ai.summarizeProperty);

  /**
   * Pick an image from the photo library
   */
  const pickImage = useCallback(async () => {
    setState(prev => ({ ...prev, isPicking: true, error: null }));

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access photo library was denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setState(prev => ({
          ...prev,
          selectedImage: result.assets[0].uri,
          isPicking: false,
        }));
      } else {
        setState(prev => ({ ...prev, isPicking: false }));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to pick image');
      setState(prev => ({ ...prev, isPicking: false, error }));
    }
  }, []);

  /**
   * Take a photo with the camera
   */
  const takePhoto = useCallback(async () => {
    setState(prev => ({ ...prev, isPicking: true, error: null }));

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access camera was denied');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setState(prev => ({
          ...prev,
          selectedImage: result.assets[0].uri,
          isPicking: false,
        }));
      } else {
        setState(prev => ({ ...prev, isPicking: false }));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to take photo');
      setState(prev => ({ ...prev, isPicking: false, error }));
    }
  }, []);

  /**
   * Convert image to base64
   */
  const getImageBase64 = useCallback(async (uri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (err) {
      throw new Error('Failed to read image file');
    }
  }, []);

  /**
   * Analyze a property image with AI
   */
  const analyzeImage = useCallback(async (
    imageUri: string,
    additionalContext?: string
  ): Promise<PropertyAnalysis> => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const base64 = await getImageBase64(imageUri);
      
      const result = await analyzePropertyAction({
        imageBase64: base64,
        additionalContext,
      });

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        analysis: result as PropertyAnalysis,
      }));

      return result as PropertyAnalysis;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Analysis failed');
      setState(prev => ({ ...prev, isAnalyzing: false, error }));
      throw error;
    }
  }, [analyzePropertyAction, getImageBase64]);

  /**
   * Get a quick summary of a property image
   */
  const summarizeImage = useCallback(async (imageUri: string): Promise<PropertySummary> => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const base64 = await getImageBase64(imageUri);
      
      const result = await summarizePropertyAction({
        imageBase64: base64,
      });

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        summary: result as PropertySummary,
      }));

      return result as PropertySummary;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Summary failed');
      setState(prev => ({ ...prev, isAnalyzing: false, error }));
      throw error;
    }
  }, [summarizePropertyAction, getImageBase64]);

  /**
   * Complete workflow: pick, upload, and analyze image
   */
  const analyzeAndUpload = useCallback(async (options: { 
    propertyId?: string; 
    roomId?: string;
  } = {}) => {
    const { selectedImage } = state;
    if (!selectedImage) {
      throw new Error('No image selected');
    }

    setState(prev => ({ ...prev, isUploading: true, error: null }));

    try {
      // Upload image to Convex storage
      const uploadResult = await uploadImage(selectedImage, {
        category: 'photo',
        propertyId: options.propertyId,
        roomId: options.roomId,
      });

      // Analyze the image
      await analyzeImage(selectedImage);

      setState(prev => ({ ...prev, isUploading: false }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload and analysis failed');
      setState(prev => ({ ...prev, isUploading: false, error }));
      throw error;
    }
  }, [state.selectedImage, uploadImage, analyzeImage]);

  /**
   * Reset the analysis state
   */
  const reset = useCallback(() => {
    setState({
      isPicking: false,
      isUploading: false,
      isAnalyzing: false,
      analysis: null,
      summary: null,
      error: null,
      selectedImage: null,
    });
  }, []);

  /**
   * Clear the selected image
   */
  const clearImage = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedImage: null,
      analysis: null,
      summary: null,
      error: null,
    }));
  }, []);

  return {
    ...state,
    isUploading: isUploadingFile || state.isUploading,
    pickImage,
    takePhoto,
    analyzeImage,
    summarizeImage,
    analyzeAndUpload,
    reset,
    clearImage,
  };
}

export default useImageAnalysis;
