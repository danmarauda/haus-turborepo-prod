/**
 * PropertyImageAnalyzer - AI-powered property image analysis component
 * 
 * Allows users to pick/take property photos, upload them to Convex storage,
 * and get AI-powered analysis including property type, features, condition,
 * and estimated price range for the Melbourne market.
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { 
  Camera, 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  Upload,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Building,
  Bed,
  Bath,
  DollarSign,
  Wrench,
  Info
} from 'lucide-react-native';
import { cn } from '../../lib/utils';
import { useImageAnalysis, PropertyAnalysis } from '../../hooks/useImageAnalysis';

export interface PropertyImageAnalyzerProps {
  propertyId?: string;
  roomId?: string;
  onAnalysisComplete?: (analysis: PropertyAnalysis, uploadId: string) => void;
  onClose?: () => void;
  className?: string;
}

/**
 * Category badge component
 */
function CategoryBadge({ 
  label, 
  value, 
  icon: Icon,
  color = '#6b7280'
}: { 
  label: string; 
  value: string | number; 
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <View className="flex-row items-center gap-2 rounded-lg bg-muted p-3">
      <Icon size={18} color={color} />
      <View>
        <Text className="text-xs text-muted-foreground">{label}</Text>
        <Text className="font-medium text-foreground">{value}</Text>
      </View>
    </View>
  );
}

/**
 * Feature chip component
 */
function FeatureChip({ feature }: { feature: string }) {
  return (
    <View className="rounded-full bg-primary/10 px-3 py-1.5">
      <Text className="text-xs font-medium text-primary">{feature}</Text>
    </View>
  );
}

/**
 * PropertyImageAnalyzer component
 */
export function PropertyImageAnalyzer({
  propertyId,
  roomId,
  onAnalysisComplete,
  onClose,
  className,
}: PropertyImageAnalyzerProps) {
  const {
    selectedImage,
    isPicking,
    isUploading,
    isAnalyzing,
    analysis,
    error,
    pickImage,
    takePhoto,
    analyzeImage,
    clearImage,
    reset,
  } = useImageAnalysis();

  const [additionalContext, setAdditionalContext] = useState('');
  const [showContextInput, setShowContextInput] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);

  /**
   * Handle analyze button press
   */
  const handleAnalyze = async () => {
    if (!selectedImage) return;

    try {
      const result = await analyzeImage(selectedImage, additionalContext || undefined);
      
      // If we have an upload ID from a previous upload, pass it back
      if (uploadId) {
        onAnalysisComplete?.(result, uploadId);
      }
    } catch (err) {
      // Error handled in hook
    }
  };

  /**
   * Handle upload and analyze
   */
  const handleUploadAndAnalyze = async () => {
    if (!selectedImage) return;

    try {
      // This would integrate with useUpload hook
      // For now, just analyze
      await handleAnalyze();
    } catch (err) {
      // Error handled in hook
    }
  };

  /**
   * Get condition badge color
   */
  const getConditionColor = (condition: string): string => {
    const colors: Record<string, string> = {
      'new': '#10b981',
      'excellent': '#059669',
      'good': '#3b82f6',
      'fair': '#f59e0b',
      'needs-renovation': '#f43f5e',
    };
    return colors[condition] || '#6b7280';
  };

  /**
   * Format condition for display
   */
  const formatCondition = (condition: string): string => {
    return condition
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <View className={cn("flex-1 bg-background", className)}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border p-4">
        <View className="flex-row items-center gap-2">
          <View className="rounded-full bg-primary/10 p-2">
            <Sparkles size={20} color="#0ea5e9" />
          </View>
          <View>
            <Text className="font-semibold text-foreground">AI Property Analysis</Text>
            <Text className="text-xs text-muted-foreground">
              Upload a photo to analyze
            </Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} className="rounded-full p-2">
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Image Selection */}
        {!selectedImage ? (
          <View className="gap-4">
            <Text className="text-center text-muted-foreground">
              Choose how you want to add a property photo
            </Text>
            
            <View className="flex-row gap-4">
              {/* Camera */}
              <TouchableOpacity
                onPress={takePhoto}
                disabled={isPicking}
                className="flex-1 items-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/50 p-6 active:bg-muted"
              >
                <View className="rounded-full bg-primary/10 p-3">
                  <Camera size={28} color="#0ea5e9" />
                </View>
                <Text className="font-medium text-foreground">Take Photo</Text>
                <Text className="text-center text-xs text-muted-foreground">
                  Use your camera to capture the property
                </Text>
              </TouchableOpacity>

              {/* Gallery */}
              <TouchableOpacity
                onPress={pickImage}
                disabled={isPicking}
                className="flex-1 items-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/50 p-6 active:bg-muted"
              >
                <View className="rounded-full bg-secondary p-3">
                  <ImageIcon size={28} color="#374151" />
                </View>
                <Text className="font-medium text-foreground">Choose Photo</Text>
                <Text className="text-center text-xs text-muted-foreground">
                  Select from your photo library
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="gap-4">
            {/* Selected Image Preview */}
            <View className="relative overflow-hidden rounded-xl">
              <Image
                source={{ uri: selectedImage }}
                className="h-64 w-full"
                contentFit="cover"
                transition={200}
              />
              
              {/* Change Image Button */}
              <TouchableOpacity
                onPress={clearImage}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-2"
              >
                <X size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Additional Context Input */}
            {!analysis && !isAnalyzing && (
              <View>
                <TouchableOpacity
                  onPress={() => setShowContextInput(!showContextInput)}
                  className="flex-row items-center gap-2 py-2"
                >
                  <Info size={16} color="#6b7280" />
                  <Text className="text-sm text-muted-foreground">
                    Add context (optional)
                  </Text>
                  <ChevronRight 
                    size={16} 
                    color="#6b7280" 
                    style={{ transform: [{ rotate: showContextInput ? '90deg' : '0deg' }] }}
                  />
                </TouchableOpacity>
                
                {showContextInput && (
                  <TextInput
                    value={additionalContext}
                    onChangeText={setAdditionalContext}
                    placeholder="E.g., 'This is a renovated Victorian terrace in Fitzroy'"
                    multiline
                    numberOfLines={3}
                    className="rounded-lg border border-border bg-background p-3 text-foreground"
                    placeholderTextColor="#9ca3af"
                  />
                )}
              </View>
            )}

            {/* Analyze Button */}
            {!analysis && !isAnalyzing && (
              <TouchableOpacity
                onPress={handleAnalyze}
                className="flex-row items-center justify-center gap-2 rounded-xl bg-primary p-4"
              >
                <Sparkles size={20} color="#ffffff" />
                <Text className="font-semibold text-white">Analyze Property</Text>
              </TouchableOpacity>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <View className="items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 p-6">
                <ActivityIndicator size="large" color="#0ea5e9" />
                <Text className="font-medium text-sky-700">Analyzing your property...</Text>
                <Text className="text-center text-sm text-sky-600/80">
                  Our AI is examining the image for property type, features, condition, and estimated value.
                </Text>
              </View>
            )}

            {/* Error State */}
            {error && (
              <View className="items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <AlertCircle size={24} color="#f43f5e" />
                <Text className="font-medium text-rose-600">Analysis Failed</Text>
                <Text className="text-center text-sm text-rose-600/80">
                  {error.message}
                </Text>
                <TouchableOpacity
                  onPress={handleAnalyze}
                  className="mt-2 rounded-lg bg-rose-500 px-4 py-2"
                >
                  <Text className="font-medium text-white">Try Again</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Analysis Results */}
            {analysis && (
              <View className="gap-4">
                {/* Success Header */}
                <View className="flex-row items-center gap-2 rounded-xl bg-emerald-50 p-4">
                  <CheckCircle size={24} color="#10b981" />
                  <View>
                    <Text className="font-semibold text-emerald-700">Analysis Complete</Text>
                    <Text className="text-sm text-emerald-600/80">
                      AI analyzed your property image
                    </Text>
                  </View>
                </View>

                {/* Property Overview */}
                <View className="rounded-xl border border-border bg-card p-4">
                  <Text className="mb-3 font-semibold text-foreground">Property Overview</Text>
                  
                  <View className="flex-row flex-wrap gap-2">
                    {analysis.propertyType && (
                      <CategoryBadge
                        label="Type"
                        value={analysis.propertyType.charAt(0).toUpperCase() + analysis.propertyType.slice(1)}
                        icon={Building}
                        color="#3b82f6"
                      />
                    )}
                    {(analysis.estimatedBedrooms !== undefined || analysis.estimatedBathrooms !== undefined) && (
                      <CategoryBadge
                        label="Rooms"
                        value={`${analysis.estimatedBedrooms ?? '?'} bed, ${analysis.estimatedBathrooms ?? '?'} bath`}
                        icon={Bed}
                        color="#8b5cf6"
                      />
                    )}
                    {analysis.condition && (
                      <CategoryBadge
                        label="Condition"
                        value={formatCondition(analysis.condition)}
                        icon={Wrench}
                        color={getConditionColor(analysis.condition)}
                      />
                    )}
                  </View>
                </View>

                {/* Price Range */}
                {analysis.priceRangeAUD && (
                  <View className="rounded-xl bg-emerald-500/10 p-4">
                    <Text className="mb-2 font-semibold text-emerald-800">Estimated Price Range</Text>
                    <View className="flex-row items-baseline gap-1">
                      <DollarSign size={24} color="#059669" />
                      <Text className="text-3xl font-bold text-emerald-700">
                        {analysis.priceRangeAUD.min.toLocaleString()}
                      </Text>
                      <Text className="text-lg text-emerald-600">-</Text>
                      <Text className="text-3xl font-bold text-emerald-700">
                        {analysis.priceRangeAUD.max.toLocaleString()}
                      </Text>
                    </View>
                    <Text className="mt-1 text-sm text-emerald-600/80">
                      Based on Melbourne market analysis
                    </Text>
                  </View>
                )}

                {/* Features */}
                {analysis.features && analysis.features.length > 0 && (
                  <View>
                    <Text className="mb-2 font-semibold text-foreground">Notable Features</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {analysis.features.map((feature, index) => (
                        <FeatureChip key={index} feature={feature} />
                      ))}
                    </View>
                  </View>
                )}

                {/* Outdoor Features */}
                {analysis.outdoorFeatures && analysis.outdoorFeatures.length > 0 && (
                  <View>
                    <Text className="mb-2 font-semibold text-foreground">Outdoor Features</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {analysis.outdoorFeatures.map((feature, index) => (
                        <FeatureChip key={index} feature={feature} />
                      ))}
                    </View>
                  </View>
                )}

                {/* Architectural Style */}
                {analysis.architecturalStyle && (
                  <View className="rounded-lg bg-muted p-3">
                    <Text className="text-sm text-muted-foreground">Architectural Style</Text>
                    <Text className="font-medium text-foreground">{analysis.architecturalStyle}</Text>
                  </View>
                )}

                {/* Marketing Description */}
                {analysis.marketingDescription && (
                  <View>
                    <Text className="mb-2 font-semibold text-foreground">Marketing Description</Text>
                    <Text className="text-sm leading-5 text-muted-foreground">
                      {analysis.marketingDescription}
                    </Text>
                  </View>
                )}

                {/* Key Selling Points */}
                {analysis.keySellingPoints && analysis.keySellingPoints.length > 0 && (
                  <View>
                    <Text className="mb-2 font-semibold text-foreground">Key Selling Points</Text>
                    <View className="gap-2">
                      {analysis.keySellingPoints.map((point, index) => (
                        <View key={index} className="flex-row items-start gap-2">
                          <ChevronRight size={16} color="#0ea5e9" className="mt-0.5" />
                          <Text className="flex-1 text-sm text-muted-foreground">{point}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Done Button */}
                <TouchableOpacity
                  onPress={() => {
                    reset();
                    onClose?.();
                  }}
                  className="mt-4 flex-row items-center justify-center gap-2 rounded-xl bg-primary p-4"
                >
                  <CheckCircle size={20} color="#ffffff" />
                  <Text className="font-semibold text-white">Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default PropertyImageAnalyzer;
