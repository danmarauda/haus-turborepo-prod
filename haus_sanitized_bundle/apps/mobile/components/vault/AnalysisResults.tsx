/**
 * AnalysisResults - Display AI analysis results for property images
 * 
 * Shows structured property analysis including type, features,
 * condition, price range, and marketing description
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { 
  Home, 
  Bed, 
  Bath, 
  Hammer, 
  TreePine, 
  DollarSign, 
  Sparkles,
  CheckCircle,
  X,
  TrendingUp,
  Info
} from 'lucide-react-native';
import { cn } from '../../lib/utils';
import { DocumentAnalysis } from './DocumentCard';

export interface AnalysisResultsProps {
  analysis: DocumentAnalysis;
  onClose?: () => void;
  onApplyToProperty?: (analysis: DocumentAnalysis) => void;
  className?: string;
}

/**
 * Get condition color
 */
function getConditionColor(condition: string): string {
  const colors: Record<string, string> = {
    'new': 'text-emerald-500',
    'excellent': 'text-emerald-600',
    'good': 'text-blue-500',
    'fair': 'text-amber-500',
    'needs-renovation': 'text-rose-500',
  };
  return colors[condition] || 'text-gray-500';
}

/**
 * Format condition for display
 */
function formatCondition(condition: string): string {
  return condition
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Info row component
 */
function InfoRow({ 
  icon: Icon, 
  label, 
  value, 
  iconColor = '#6b7280' 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: React.ReactNode;
  iconColor?: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-2">
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-muted">
        <Icon size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-muted-foreground">{label}</Text>
        <Text className="text-sm font-medium text-foreground">{value}</Text>
      </View>
    </View>
  );
}

/**
 * Feature tag component
 */
function FeatureTag({ feature }: { feature: string }) {
  return (
    <View className="rounded-full bg-muted px-3 py-1">
      <Text className="text-xs text-foreground">{feature}</Text>
    </View>
  );
}

/**
 * AnalysisResults component
 */
export function AnalysisResults({
  analysis,
  onClose,
  onApplyToProperty,
  className,
}: AnalysisResultsProps) {
  if (analysis.status === 'failed') {
    return (
      <View className={cn("rounded-xl border border-rose-200 bg-rose-50 p-4", className)}>
        <View className="flex-row items-center gap-2">
          <X size={20} color="#f43f5e" />
          <Text className="font-medium text-rose-600">Analysis Failed</Text>
        </View>
        {analysis.error && (
          <Text className="mt-2 text-sm text-rose-600/80">{analysis.error}</Text>
        )}
      </View>
    );
  }

  if (analysis.status === 'pending' || analysis.status === 'processing') {
    return (
      <View className={cn("rounded-xl border border-sky-200 bg-sky-50 p-4", className)}>
        <View className="flex-row items-center gap-2">
          <Sparkles size={20} color="#0ea5e9" className="animate-pulse" />
          <Text className="font-medium text-sky-600">
            {analysis.status === 'pending' ? 'Analysis Pending...' : 'Analyzing Image...'}
          </Text>
        </View>
        <Text className="mt-2 text-sm text-sky-600/80">
          Our AI is analyzing your property image. This may take a few moments.
        </Text>
      </View>
    );
  }

  // Completed analysis
  return (
    <View className={cn("rounded-xl border border-border bg-card", className)}>
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border p-4">
        <View className="flex-row items-center gap-2">
          <View className="rounded-full bg-emerald-500/10 p-2">
            <CheckCircle size={20} color="#10b981" />
          </View>
          <View>
            <Text className="font-semibold text-foreground">AI Analysis Complete</Text>
            <Text className="text-xs text-muted-foreground">
              {analysis.confidence ? `${Math.round(analysis.confidence * 100)}% confidence` : 'Analysis complete'}
            </Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} className="rounded-full p-2">
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="p-4">
        {/* Property Overview */}
        <View className="mb-4 rounded-lg bg-muted/50 p-3">
          <Text className="mb-2 text-sm font-medium text-foreground">Property Overview</Text>
          
          {analysis.propertyType && (
            <InfoRow 
              icon={Home}
              label="Property Type"
              value={analysis.propertyType.charAt(0).toUpperCase() + analysis.propertyType.slice(1)}
              iconColor="#3b82f6"
            />
          )}
          
          {(analysis.estimatedBedrooms !== undefined || analysis.estimatedBathrooms !== undefined) && (
            <InfoRow 
              icon={Bed}
              label="Bedrooms / Bathrooms"
              value={`${analysis.estimatedBedrooms ?? '?'} bed / ${analysis.estimatedBathrooms ?? '?'} bath`}
              iconColor="#8b5cf6"
            />
          )}
          
          {analysis.condition && (
            <InfoRow 
              icon={Hammer}
              label="Condition"
              value={
                <Text className={cn("font-medium", getConditionColor(analysis.condition))}>
                  {formatCondition(analysis.condition)}
                </Text>
              }
              iconColor="#f59e0b"
            />
          )}
        </View>

        {/* Price Range */}
        {analysis.priceRange && (
          <View className="mb-4 rounded-lg bg-emerald-50 p-3">
            <Text className="mb-2 text-sm font-medium text-emerald-800">Estimated Price Range</Text>
            <View className="flex-row items-center gap-2">
              <DollarSign size={24} color="#10b981" />
              <Text className="text-2xl font-bold text-emerald-700">
                ${analysis.priceRange.min.toLocaleString()} - ${analysis.priceRange.max.toLocaleString()}
              </Text>
            </View>
            <Text className="mt-1 text-xs text-emerald-600/80">
              Based on Melbourne market analysis
            </Text>
          </View>
        )}

        {/* Features */}
        {analysis.features && analysis.features.length > 0 && (
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-foreground">Notable Features</Text>
            <View className="flex-row flex-wrap gap-2">
              {analysis.features.map((feature, index) => (
                <FeatureTag key={index} feature={feature} />
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        {analysis.description && (
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-foreground">Description</Text>
            <Text className="text-sm leading-5 text-muted-foreground">
              {analysis.description}
            </Text>
          </View>
        )}

        {/* Analyzed timestamp */}
        {analysis.analyzedAt && (
          <Text className="text-xs text-muted-foreground/60">
            Analyzed on {new Date(analysis.analyzedAt).toLocaleDateString('en-AU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
      </ScrollView>

      {/* Actions */}
      {onApplyToProperty && (
        <View className="border-t border-border p-4">
          <TouchableOpacity
            onPress={() => onApplyToProperty(analysis)}
            className="flex-row items-center justify-center gap-2 rounded-lg bg-primary p-3"
          >
            <TrendingUp size={18} color="#ffffff" />
            <Text className="font-medium text-white">Apply to Property</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/**
 * Compact analysis badge for list views
 */
export function AnalysisBadge({ status }: { status: AnalysisStatus }) {
  const config = {
    pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Pending' },
    processing: { bg: 'bg-sky-500/10', text: 'text-sky-600', label: 'Analyzing' },
    completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: 'Analyzed' },
    failed: { bg: 'bg-rose-500/10', text: 'text-rose-600', label: 'Failed' },
  };

  const { bg, text, label } = config[status];

  return (
    <View className={cn("rounded-full px-2 py-0.5", bg)}>
      <Text className={cn("text-xs font-medium", text)}>{label}</Text>
    </View>
  );
}

export default AnalysisResults;
