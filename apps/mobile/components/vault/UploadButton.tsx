/**
 * UploadButton - Document upload component
 * 
 * Supports picking documents and images with category selection
 * Shows upload progress and handles errors
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Upload, FileText, Image as ImageIcon, X, Check, Camera } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { cn } from '../../lib/utils';
import { DocumentCategory } from './DocumentCard';

export interface UploadButtonProps {
  onUpload: (uri: string, filename: string, mimeType: string, category: DocumentCategory) => Promise<void>;
  onImageUpload?: (uri: string, category: DocumentCategory) => Promise<void>;
  allowedCategories?: DocumentCategory[];
  className?: string;
  disabled?: boolean;
}

const categoryOptions: { value: DocumentCategory; label: string; description: string }[] = [
  { value: 'contract', label: 'Contract', description: 'Property contracts & agreements' },
  { value: 'report', label: 'Report', description: 'Inspection & valuation reports' },
  { value: 'photo', label: 'Photo', description: 'Property photos' },
  { value: 'id', label: 'ID Document', description: 'Passport, Driver\'s License' },
  { value: 'payslip', label: 'Payslip', description: 'Employment income proof' },
  { value: 'bank_statement', label: 'Bank Statement', description: 'Financial records' },
  { value: 'other', label: 'Other', description: 'Miscellaneous documents' },
];

interface PendingFile {
  uri: string;
  filename: string;
  mimeType: string;
}

/**
 * UploadButton component
 */
export function UploadButton({
  onUpload,
  onImageUpload,
  allowedCategories,
  className,
  disabled = false,
}: UploadButtonProps) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = allowedCategories 
    ? categoryOptions.filter(c => allowedCategories.includes(c.value))
    : categoryOptions;

  /**
   * Perform the upload
   */
  const performUpload = useCallback(async (
    uri: string, 
    filename: string, 
    mimeType: string, 
    category: DocumentCategory
  ) => {
    setIsUploading(true);
    setShowCategoryModal(false);
    setPendingFile(null);

    try {
      await onUpload(uri, filename, mimeType, category);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  /**
   * Perform image upload
   */
  const performImageUpload = useCallback(async (uri: string, category: DocumentCategory) => {
    setIsUploading(true);

    try {
      if (onImageUpload) {
        await onImageUpload(uri, category);
      } else {
        // Fall back to regular upload
        const filename = uri.split('/').pop() || 'image.jpg';
        await onUpload(uri, filename, 'image/jpeg', category);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, onImageUpload]);

  /**
   * Handle category selection
   */
  const handleCategorySelect = useCallback((category: DocumentCategory) => {
    if (pendingFile) {
      performUpload(pendingFile.uri, pendingFile.filename, pendingFile.mimeType, category);
    }
  }, [pendingFile, performUpload]);

  /**
   * Pick a document file
   */
  const handlePickDocument = useCallback(async () => {
    setError(null);
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const file = result.assets[0];
      setPendingFile({
        uri: file.uri,
        filename: file.name,
        mimeType: file.mimeType || 'application/octet-stream',
      });
      setShowCategoryModal(true);
    } catch (err) {
      setError('Failed to pick document');
    }
  }, []);

  /**
   * Pick an image from gallery
   */
  const handlePickImage = useCallback(async () => {
    setError(null);

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access photo library was denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const image = result.assets[0];
      await performImageUpload(image.uri, 'photo');
    } catch (err) {
      setError('Failed to pick image');
    }
  }, [performImageUpload]);

  /**
   * Take a photo with camera
   */
  const handleTakePhoto = useCallback(async () => {
    setError(null);

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access camera was denied');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const image = result.assets[0];
      await performImageUpload(image.uri, 'photo');
    } catch (err) {
      setError('Failed to take photo');
    }
  }, [performImageUpload]);

  if (isUploading) {
    return (
      <View className={cn(
        "flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4",
        className
      )}>
        <ActivityIndicator size="small" color="#0ea5e9" />
        <Text className="text-sm font-medium text-primary">Uploading...</Text>
      </View>
    );
  }

  return (
    <>
      <View className={cn("flex-row gap-2", className)}>
        {/* Document Upload */}
        <TouchableOpacity
          onPress={handlePickDocument}
          disabled={disabled}
          className={cn(
            "flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary p-4",
            disabled && "opacity-50"
          )}
        >
          <FileText size={20} color="#ffffff" />
          <Text className="font-medium text-white">Document</Text>
        </TouchableOpacity>

        {/* Image Upload */}
        <TouchableOpacity
          onPress={handlePickImage}
          disabled={disabled}
          className={cn(
            "flex-row items-center justify-center gap-2 rounded-xl bg-secondary p-4",
            disabled && "opacity-50"
          )}
        >
          <ImageIcon size={20} color="#374151" />
        </TouchableOpacity>

        {/* Camera */}
        <TouchableOpacity
          onPress={handleTakePhoto}
          disabled={disabled}
          className={cn(
            "flex-row items-center justify-center gap-2 rounded-xl bg-secondary p-4",
            disabled && "opacity-50"
          )}
        >
          <Camera size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {error && (
        <Text className="mt-2 text-sm text-destructive">{error}</Text>
      )}

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowCategoryModal(false);
          setPendingFile(null);
        }}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-3xl bg-card p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">
                Select Category
              </Text>
              <TouchableOpacity onPress={() => {
                setShowCategoryModal(false);
                setPendingFile(null);
              }}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text className="mb-4 text-sm text-muted-foreground">
              Choose a category for this document
            </Text>

            <View className="gap-2">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  onPress={() => handleCategorySelect(category.value)}
                  className="flex-row items-center justify-between rounded-xl border border-border bg-background p-4 active:bg-muted"
                >
                  <View>
                    <Text className="font-medium text-foreground">
                      {category.label}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {category.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default UploadButton;
