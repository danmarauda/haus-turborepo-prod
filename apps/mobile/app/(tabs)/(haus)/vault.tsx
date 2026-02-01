/**
 * Vault Screen - Secure Document Vault
 * 
 * Document management screen for storing and organizing property-related documents.
 * Features include file upload, AI-powered image analysis, category organization,
 * and secure storage via Convex.
 * 
 * Categories:
 * - Contracts: Property contracts & agreements
 * - Reports: Inspection & valuation reports  
 * - Photos: Property photos with AI analysis
 * - ID Documents: Passport, Driver's License
 * - Payslips: Employment income proof
 * - Bank Statements: Financial records
 */

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Lock, 
  Shield, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  FileCheck,
  Receipt,
  Banknote,
  Camera,
  ChevronDown,
  Sparkles,
  X,
  Trash2,
  Search,
  Filter
} from 'lucide-react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@haus/backend';
import { DocumentCard, UploadButton, AnalysisResults, DocumentCategory, VaultDocument } from '@/components/vault';
import { PropertyImageAnalyzer } from '@/components/ai';
import { useUpload } from '@/hooks/useUpload';
import { useImageAnalysis } from '@/hooks/useImageAnalysis';
import { cn } from '@/lib/utils';

// Category configuration
const CATEGORIES: { 
  value: DocumentCategory; 
  label: string; 
  icon: React.ElementType;
  color: string;
  description: string;
}[] = [
  { 
    value: 'contract', 
    label: 'Contracts', 
    icon: FileCheck, 
    color: '#3b82f6',
    description: 'Property contracts & agreements'
  },
  { 
    value: 'report', 
    label: 'Reports', 
    icon: FileText, 
    color: '#a855f7',
    description: 'Inspection & valuation reports'
  },
  { 
    value: 'photo', 
    label: 'Photos', 
    icon: Camera, 
    color: '#10b981',
    description: 'Property photos with AI analysis'
  },
  { 
    value: 'id', 
    label: 'ID Documents', 
    icon: FileText, 
    color: '#0ea5e9',
    description: 'Passport, Driver\'s License'
  },
  { 
    value: 'payslip', 
    label: 'Payslips', 
    icon: Receipt, 
    color: '#f59e0b',
    description: 'Employment income proof'
  },
  { 
    value: 'bank_statement', 
    label: 'Bank Statements', 
    icon: Banknote, 
    color: '#22c55e',
    description: 'Financial records'
  },
  { 
    value: 'other', 
    label: 'Other', 
    icon: FileText, 
    color: '#6b7280',
    description: 'Miscellaneous documents'
  },
];

// Pre-approval requirements
const REQUIREMENTS = [
  { category: 'id' as DocumentCategory, label: 'Photo ID (Passport or Driver\'s License)', required: 1 },
  { category: 'payslip' as DocumentCategory, label: 'Last 2 payslips', required: 2 },
  { category: 'bank_statement' as DocumentCategory, label: 'Last 3 months bank statements', required: 3 },
];

/**
 * Category filter chip
 */
function CategoryChip({ 
  category, 
  isSelected, 
  onPress,
  count
}: { 
  category: typeof CATEGORIES[0]; 
  isSelected: boolean;
  onPress: () => void;
  count?: number;
}) {
  const Icon = category.icon;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        "mr-2 flex-row items-center gap-1.5 rounded-full border px-3 py-1.5",
        isSelected 
          ? "border-primary bg-primary" 
          : "border-border bg-card"
      )}
    >
      <Icon size={14} color={isSelected ? '#ffffff' : category.color} />
      <Text className={cn(
        "text-xs font-medium",
        isSelected ? "text-primary-foreground" : "text-foreground"
      )}>
        {category.label}
      </Text>
      {count !== undefined && count > 0 && (
        <View className={cn(
          "ml-1 rounded-full px-1.5 py-0.5",
          isSelected ? "bg-white/20" : "bg-muted"
        )}>
          <Text className={cn(
            "text-xs",
            isSelected ? "text-white" : "text-muted-foreground"
          )}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

/**
 * Requirement item
 */
function RequirementItem({ 
  requirement, 
  current 
}: { 
  requirement: typeof REQUIREMENTS[0]; 
  current: number;
}) {
  const isComplete = current >= requirement.required;
  
  return (
    <View className="flex-row items-center gap-3 py-2">
      <View className={cn(
        "h-6 w-6 items-center justify-center rounded-full",
        isComplete ? "bg-emerald-500" : "bg-muted"
      )}>
        {isComplete ? (
          <FileCheck size={14} color="#ffffff" />
        ) : (
          <View className="h-2 w-2 rounded-full bg-muted-foreground/50" />
        )}
      </View>
      <View className="flex-1">
        <Text className={cn(
          "text-sm",
          isComplete ? "text-foreground" : "text-muted-foreground"
        )}>
          {requirement.label}
        </Text>
        <Text className="text-xs text-muted-foreground/70">
          {current} of {requirement.required} uploaded
        </Text>
      </View>
    </View>
  );
}

/**
 * Empty state component
 */
function EmptyState({ 
  category, 
  onUpload 
}: { 
  category?: DocumentCategory;
  onUpload: () => void;
}) {
  const categoryInfo = category ? CATEGORIES.find(c => c.value === category) : null;
  
  return (
    <View className="items-center justify-center py-12">
      <View className="mb-4 rounded-full bg-muted p-4">
        {categoryInfo ? (
          <categoryInfo.icon size={32} color={categoryInfo.color} />
        ) : (
          <FileText size={32} color="#6b7280" />
        )}
      </View>
      <Text className="mb-1 text-lg font-medium text-foreground">
        No documents yet
      </Text>
      <Text className="mb-4 text-center text-sm text-muted-foreground">
        {categoryInfo 
          ? `Upload your first ${categoryInfo.label.toLowerCase()} document`
          : 'Upload your first document to get started'
        }
      </Text>
      <TouchableOpacity
        onPress={onUpload}
        className="flex-row items-center gap-2 rounded-lg bg-primary px-4 py-2"
      >
        <Upload size={16} color="#ffffff" />
        <Text className="font-medium text-white">Upload Document</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Vault Screen Component
 */
export default function VaultScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);
  const [showImageAnalyzer, setShowImageAnalyzer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<VaultDocument | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { uploadDocument, isUploading } = useUpload();

  // Fetch documents from Convex
  const documents = useQuery(api.propertyUploads.list, { 
    category: selectedCategory ?? undefined 
  }) ?? [];

  // Mutations
  const deleteDocument = useMutation(api.propertyUploads.remove);
  const requestAnalysis = useMutation(api.propertyUploads.requestAnalysis);

  /**
   * Handle document upload
   */
  const handleUpload = useCallback(async (
    uri: string, 
    filename: string, 
    mimeType: string, 
    category: DocumentCategory
  ) => {
    try {
      await uploadDocument(uri, filename, mimeType, { category });
      
      // If it's a photo, offer to analyze
      if (category === 'photo' && mimeType.startsWith('image/')) {
        Alert.alert(
          'Analyze Photo?',
          'Would you like our AI to analyze this property photo?',
          [
            { text: 'Not Now', style: 'cancel' },
            { 
              text: 'Analyze', 
              onPress: () => setShowImageAnalyzer(true)
            },
          ]
        );
      }
    } catch (err) {
      Alert.alert('Upload Failed', err instanceof Error ? err.message : 'Failed to upload document');
    }
  }, [uploadDocument]);

  /**
   * Handle document deletion
   */
  const handleDelete = useCallback((document: VaultDocument) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument({ uploadId: document.uploadId });
            } catch (err) {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  }, [deleteDocument]);

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Convex queries auto-refresh, this is for UI feedback
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  /**
   * Get document count by category
   */
  const getCategoryCount = (category: DocumentCategory) => {
    return documents.filter(d => d.category === category).length;
  };

  /**
   * Filter documents by selected category
   */
  const filteredDocuments = selectedCategory
    ? documents.filter(d => d.category === selectedCategory)
    : documents;

  /**
   * Count requirements fulfillment
   */
  const getRequirementCount = (category: DocumentCategory) => {
    return documents.filter(d => d.category === category).length;
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View className="px-4">
          <View className="mb-4 flex-row items-center gap-2">
            <View className="rounded-full bg-primary/10 p-2">
              <Lock size={24} color="#0ea5e9" />
            </View>
            <View>
              <Text className="text-2xl font-bold text-foreground">Document Vault</Text>
              <Text className="text-sm text-muted-foreground">Bank-level secure storage</Text>
            </View>
          </View>

          {/* Security Badge */}
          <View className="mb-6 flex-row items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
            <View className="rounded-full bg-sky-500 p-2">
              <Shield size={18} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-sky-800">Secure & Encrypted</Text>
              <Text className="text-sm text-sky-600/80">
                Your documents are encrypted end-to-end and stored securely.
              </Text>
            </View>
          </View>

          {/* Upload Buttons */}
          <UploadButton
            onUpload={handleUpload}
            className="mb-6"
            disabled={isUploading}
          />

          {/* Category Filter */}
          <View className="mb-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-semibold text-foreground">Categories</Text>
              {selectedCategory && (
                <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                  <Text className="text-sm text-primary">Clear Filter</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="flex-row"
            >
              {CATEGORIES.map((category) => (
                <CategoryChip
                  key={category.value}
                  category={category}
                  isSelected={selectedCategory === category.value}
                  onPress={() => setSelectedCategory(
                    selectedCategory === category.value ? null : category.value
                  )}
                  count={getCategoryCount(category.value)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Documents Section */}
          <View className="mb-6">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-semibold text-foreground">
                Your Documents ({filteredDocuments.length})
              </Text>
              <TouchableOpacity 
                onPress={() => setShowImageAnalyzer(true)}
                className="flex-row items-center gap-1 rounded-full bg-primary/10 px-3 py-1"
              >
                <Sparkles size={14} color="#0ea5e9" />
                <Text className="text-sm font-medium text-primary">AI Analyze</Text>
              </TouchableOpacity>
            </View>

            {filteredDocuments.length === 0 ? (
              <EmptyState 
                category={selectedCategory ?? undefined}
                onUpload={() => {}}
              />
            ) : (
              <View className="flex-row flex-wrap gap-3">
                {filteredDocuments.map((doc) => (
                  <View key={doc.id} className="w-[48%]">
                    <DocumentCard
                      document={doc}
                      onPress={setSelectedDocument}
                      onDelete={handleDelete}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Pre-approval Requirements */}
          <View className="rounded-xl border border-border bg-card p-4">
            <Text className="mb-3 font-semibold text-foreground">
              Pre-approval Requirements
            </Text>
            <View>
              {REQUIREMENTS.map((req) => (
                <RequirementItem
                  key={req.category}
                  requirement={req}
                  current={getRequirementCount(req.category)}
                />
              ))}
            </View>
            
            {/* Progress */}
            <View className="mt-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Completion Progress</Text>
                <Text className="text-sm font-medium text-foreground">
                  {REQUIREMENTS.filter(r => getRequirementCount(r.category) >= r.required).length} of {REQUIREMENTS.length}
                </Text>
              </View>
              <View className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <View 
                  className="h-full rounded-full bg-emerald-500"
                  style={{ 
                    width: `${(REQUIREMENTS.filter(r => getRequirementCount(r.category) >= r.required).length / REQUIREMENTS.length) * 100}%` 
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Image Analyzer Modal */}
      <Modal
        visible={showImageAnalyzer}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowImageAnalyzer(false)}
      >
        <PropertyImageAnalyzer
          onClose={() => setShowImageAnalyzer(false)}
          onAnalysisComplete={(analysis, uploadId) => {
            setShowImageAnalyzer(false);
            // Could save analysis to document here
          }}
        />
      </Modal>

      {/* Document Detail Modal */}
      <Modal
        visible={!!selectedDocument}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedDocument(null)}
      >
        {selectedDocument && (
          <View className="flex-1 bg-background">
            <View className="flex-row items-center justify-between border-b border-border p-4">
              <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
                {selectedDocument.name}
              </Text>
              <TouchableOpacity onPress={() => setSelectedDocument(null)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView className="flex-1 p-4">
              {selectedDocument.analysis ? (
                <AnalysisResults
                  analysis={selectedDocument.analysis}
                  onClose={() => setSelectedDocument(null)}
                />
              ) : (
                <View className="items-center py-12">
                  <FileText size={48} color="#6b7280" />
                  <Text className="mt-4 text-muted-foreground">
                    No analysis available for this document
                  </Text>
                  {selectedDocument.category === 'photo' && (
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          await requestAnalysis({ uploadId: selectedDocument.uploadId });
                          Alert.alert('Analysis Requested', 'AI analysis has been queued for this image.');
                        } catch (err) {
                          Alert.alert('Error', 'Failed to request analysis');
                        }
                      }}
                      className="mt-4 flex-row items-center gap-2 rounded-lg bg-primary px-4 py-2"
                    >
                      <Sparkles size={16} color="#ffffff" />
                      <Text className="font-medium text-white">Request AI Analysis</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}
