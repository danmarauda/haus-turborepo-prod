/**
 * useUpload - File upload hook for Convex storage
 * 
 * Handles file uploads to Convex storage with progress tracking
 * Integrates with propertyUploads table for metadata storage
 */

import { useState, useCallback } from 'react';
import { useMutation, useAction } from 'convex/react';
import { api } from '@haus/backend';
import * as FileSystem from 'expo-file-system';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  category?: 'contract' | 'report' | 'photo' | 'id' | 'payslip' | 'bank_statement' | 'other';
  propertyId?: string;
  roomId?: string;
  metadata?: Record<string, unknown>;
  onProgress?: (progress: UploadProgress) => void;
}

export interface UploadResult {
  uploadId: string;
  storageId: string;
  url: string;
}

export interface UseUploadReturn {
  uploadFile: (uri: string, filename: string, mimeType: string, options?: UploadOptions) => Promise<UploadResult>;
  uploadImage: (uri: string, options?: UploadOptions) => Promise<UploadResult>;
  uploadDocument: (uri: string, filename: string, options?: UploadOptions) => Promise<UploadResult>;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: Error | null;
  reset: () => void;
}

/**
 * Hook for uploading files to Convex storage
 */
export function useUpload(): UseUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Generate upload URL from Convex
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  
  // Create property upload record
  const createPropertyUpload = useMutation(api.propertyUploads.create);

  /**
   * Upload a file to Convex storage
   */
  const uploadFile = useCallback(async (
    uri: string,
    filename: string,
    mimeType: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> => {
    setIsUploading(true);
    setError(null);
    setProgress({ loaded: 0, total: 0, percentage: 0 });

    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      const totalSize = fileInfo.size || 0;

      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file with progress tracking
      const uploadResult = await FileSystem.uploadAsync(uploadUrl, uri, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          'Content-Type': mimeType,
        },
      });

      if (uploadResult.status !== 200) {
        throw new Error(`Upload failed with status ${uploadResult.status}`);
      }

      // Parse storage ID from response
      const storageId = JSON.parse(uploadResult.body);

      // Update progress to 100%
      setProgress({
        loaded: totalSize,
        total: totalSize,
        percentage: 100,
      });

      // Create property upload record
      const uploadId = await createPropertyUpload({
        sourceType: mimeType.startsWith('image/') ? 'image' : 'document',
        storageId,
        filename,
        mimeType,
        size: totalSize,
        category: options.category || 'other',
        propertyId: options.propertyId,
        roomId: options.roomId,
        metadata: options.metadata,
      });

      // Get the URL for the uploaded file
      const url = `${process.env.EXPO_PUBLIC_CONVEX_URL}/api/storage/${storageId}`;

      return {
        uploadId,
        storageId,
        url,
      };
    } catch (err) {
      const uploadError = err instanceof Error ? err : new Error('Upload failed');
      setError(uploadError);
      throw uploadError;
    } finally {
      setIsUploading(false);
    }
  }, [generateUploadUrl, createPropertyUpload]);

  /**
   * Upload an image file
   */
  const uploadImage = useCallback(async (
    uri: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> => {
    const filename = uri.split('/').pop() || 'image.jpg';
    const mimeType = 'image/jpeg';
    return uploadFile(uri, filename, mimeType, { ...options, category: options.category || 'photo' });
  }, [uploadFile]);

  /**
   * Upload a document file
   */
  const uploadDocument = useCallback(async (
    uri: string,
    filename: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> => {
    const mimeType = getMimeTypeFromFilename(filename);
    return uploadFile(uri, filename, mimeType, options);
  }, [uploadFile]);

  /**
   * Reset the upload state
   */
  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(null);
    setError(null);
  }, []);

  return {
    uploadFile,
    uploadImage,
    uploadDocument,
    isUploading,
    progress,
    error,
    reset,
  };
}

/**
 * Get MIME type from filename extension
 */
function getMimeTypeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

export default useUpload;
