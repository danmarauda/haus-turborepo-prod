/**
 * DocumentCard - Card component for vault documents
 * 
 * Displays document information with thumbnail, metadata,
 * and actions for viewing, downloading, and deleting
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { 
  FileText, 
  FileImage, 
  File, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  MoreVertical,
  Download,
  FileCheck,
  Banknote,
  Receipt,
  Camera
} from 'lucide-react-native';
import { cn } from '../../lib/utils';

export type DocumentCategory = 
  | 'contract' 
  | 'report' 
  | 'photo' 
  | 'id' 
  | 'payslip' 
  | 'bank_statement' 
  | 'other';

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DocumentAnalysis {
  status: AnalysisStatus;
  propertyType?: string;
  estimatedBedrooms?: number;
  estimatedBathrooms?: number;
  condition?: string;
  features?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  description?: string;
  confidence?: number;
  analyzedAt?: number;
  error?: string;
}

export interface VaultDocument {
  id: string;
  uploadId: string;
  name: string;
  category: DocumentCategory;
  size: number;
  mimeType: string;
  uploadedAt: number;
  thumbnailUrl?: string;
  storageUrl?: string;
  analysis?: DocumentAnalysis;
  propertyId?: string;
  roomId?: string;
}

export interface DocumentCardProps {
  document: VaultDocument;
  onPress?: (document: VaultDocument) => void;
  onDelete?: (document: VaultDocument) => void;
  onDownload?: (document: VaultDocument) => void;
  className?: string;
}

/**
 * Format file size to human readable
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format date to locale string
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get icon based on document category
 */
function getCategoryIcon(category: DocumentCategory, size: number = 20, color?: string) {
  const props = { size, strokeWidth: 2, color };
  
  switch (category) {
    case 'contract':
      return <FileCheck {...props} color={color || '#3b82f6'} />;
    case 'report':
      return <FileText {...props} color={color || '#a855f7'} />;
    case 'photo':
      return <Camera {...props} color={color || '#10b981'} />;
    case 'id':
      return <FileText {...props} color={color || '#0ea5e9'} />;
    case 'payslip':
      return <Receipt {...props} color={color || '#f59e0b'} />;
    case 'bank_statement':
      return <Banknote {...props} color={color || '#22c55e'} />;
    default:
      return <File {...props} color={color || '#6b7280'} />;
  }
}

/**
 * Get background color based on document category
 */
function getCategoryColor(category: DocumentCategory): string {
  switch (category) {
    case 'contract':
      return 'bg-blue-500/10';
    case 'report':
      return 'bg-purple-500/10';
    case 'photo':
      return 'bg-emerald-500/10';
    case 'id':
      return 'bg-sky-500/10';
    case 'payslip':
      return 'bg-amber-500/10';
    case 'bank_statement':
      return 'bg-green-500/10';
    default:
      return 'bg-gray-500/10';
  }
}

/**
 * Get label for document category
 */
function getCategoryLabel(category: DocumentCategory): string {
  const labels: Record<DocumentCategory, string> = {
    contract: 'Contract',
    report: 'Report',
    photo: 'Photo',
    id: 'ID Document',
    payslip: 'Payslip',
    bank_statement: 'Bank Statement',
    other: 'Document',
  };
  return labels[category];
}

/**
 * Get analysis status badge
 */
function AnalysisStatusBadge({ analysis }: { analysis?: DocumentAnalysis }) {
  if (!analysis) return null;

  const statusConfig: Record<AnalysisStatus, { icon: React.ReactNode; text: string; className: string; textColor: string }> = {
    pending: {
      icon: <AlertCircle size={12} color="#f59e0b" />,
      text: 'Pending',
      className: 'bg-amber-500/10',
      textColor: 'text-amber-600',
    },
    processing: {
      icon: <ActivityIndicator size={12} color="#0ea5e9" />,
      text: 'Analyzing...',
      className: 'bg-sky-500/10',
      textColor: 'text-sky-600',
    },
    completed: {
      icon: <CheckCircle size={12} color="#10b981" />,
      text: 'Analyzed',
      className: 'bg-emerald-500/10',
      textColor: 'text-emerald-600',
    },
    failed: {
      icon: <AlertCircle size={12} color="#f43f5e" />,
      text: 'Failed',
      className: 'bg-rose-500/10',
      textColor: 'text-rose-600',
    },
  };

  const config = statusConfig[analysis.status];

  return (
    <View className={cn("flex-row items-center gap-1 rounded-full px-2 py-0.5", config.className)}>
      {config.icon}
      <Text className={cn("text-xs font-medium", config.textColor)}>{config.text}</Text>
    </View>
  );
}

/**
 * Document thumbnail component
 */
function DocumentThumbnail({ document }: { document: VaultDocument }) {
  const isImage = document.mimeType.startsWith('image/');

  if (isImage && document.thumbnailUrl) {
    return (
      <Image
        source={{ uri: document.thumbnailUrl }}
        className="h-full w-full"
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View className={cn("h-full w-full items-center justify-center", getCategoryColor(document.category))}>
      {getCategoryIcon(document.category, 24)}
    </View>
  );
}

/**
 * DocumentCard component
 */
export function DocumentCard({
  document,
  onPress,
  onDelete,
  onDownload,
  className,
}: DocumentCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress?.(document)}
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
      activeOpacity={0.9}
    >
      {/* Thumbnail */}
      <View className="h-32 w-full bg-muted">
        <DocumentThumbnail document={document} />
        
        {/* Analysis Badge */}
        {document.analysis && (
          <View className="absolute bottom-2 left-2">
            <AnalysisStatusBadge analysis={document.analysis} />
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-3">
        {/* Title */}
        <Text 
          className="mb-1 text-sm font-medium text-foreground"
          numberOfLines={1}
        >
          {document.name}
        </Text>

        {/* Meta info */}
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-muted-foreground">
            {getCategoryLabel(document.category)}
          </Text>
          <Text className="text-xs text-muted-foreground">•</Text>
          <Text className="text-xs text-muted-foreground">
            {formatFileSize(document.size)}
          </Text>
        </View>

        {/* Upload date */}
        <Text className="mt-1 text-xs text-muted-foreground/70">
          {formatDate(new Date(document.uploadedAt))}
        </Text>

        {/* Analysis preview */}
        {document.analysis?.status === 'completed' && (
          <View className="mt-2 rounded-lg bg-muted/50 p-2">
            {document.analysis.propertyType && (
              <Text className="text-xs text-foreground">
                <Text className="font-medium">Type: </Text>
                {document.analysis.propertyType}
              </Text>
            )}
            {(document.analysis.estimatedBedrooms || document.analysis.estimatedBathrooms) && (
              <Text className="text-xs text-muted-foreground">
                {document.analysis.estimatedBedrooms && `${document.analysis.estimatedBedrooms} bed`}
                {document.analysis.estimatedBedrooms && document.analysis.estimatedBathrooms && ', '}
                {document.analysis.estimatedBathrooms && `${document.analysis.estimatedBathrooms} bath`}
              </Text>
            )}
            {document.analysis.priceRange && (
              <Text className="text-xs text-emerald-600">
                ${document.analysis.priceRange.min.toLocaleString()} - ${document.analysis.priceRange.max.toLocaleString()}
              </Text>
            )}
          </View>
        )}

        {/* Actions */}
        <View className="mt-3 flex-row justify-end gap-2">
          {onDownload && (
            <TouchableOpacity
              onPress={() => onDownload(document)}
              className="rounded-full bg-muted p-2"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Download size={16} color="#6b7280" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(document)}
              className="rounded-full bg-rose-500/10 p-2"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={16} color="#f43f5e" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default DocumentCard;
