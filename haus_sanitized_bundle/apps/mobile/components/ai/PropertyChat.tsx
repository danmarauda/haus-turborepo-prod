/**
 * PropertyChat - Property-specific AI chat component
 *
 * Use this component on property detail screens to provide
 * contextual AI assistance about a specific property.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { X, Sparkles, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { CompactChat } from './ChatContainer';
import { useAIChat } from '../../hooks/useAIChat';

// =============================================================================
// Types
// =============================================================================

interface PropertyChatProps {
  propertyId: string;
  propertyData?: {
    address?: string;
    suburb?: string;
    price?: string;
    bedrooms?: number;
    bathrooms?: number;
  };
  userId?: string;
  visible: boolean;
  onClose: () => void;
}

interface PropertyChatButtonProps {
  propertyId: string;
  propertyData?: PropertyChatProps['propertyData'];
  userId?: string;
  variant?: 'floating' | 'inline';
  onPress?: () => void;
}

// =============================================================================
// Property Chat Modal
// =============================================================================

export function PropertyChat({
  propertyId,
  propertyData,
  userId,
  visible,
  onClose,
}: PropertyChatProps) {
  // Build property-specific system prompt
  const systemPrompt = useMemo(() => {
    const basePrompt = `You are HAUS, an AI assistant for Australian real estate.
You are currently helping with a specific property inquiry.

Property Information:
- ID: ${propertyId}
${propertyData?.address ? `- Address: ${propertyData.address}` : ''}
${propertyData?.suburb ? `- Suburb: ${propertyData.suburb}` : ''}
${propertyData?.price ? `- Price: ${propertyData.price}` : ''}
${propertyData?.bedrooms ? `- Bedrooms: ${propertyData.bedrooms}` : ''}
${propertyData?.bathrooms ? `- Bathrooms: ${propertyData.bathrooms}` : ''}

Provide helpful insights about this property, including:
- Property features and condition
- Market context for the area
- Comparable sales
- Investment potential
- Lifestyle factors

Be professional, accurate, and use Australian real estate terminology.`;

    return basePrompt;
  }, [propertyId, propertyData]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Sparkles size={24} color="#fff" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Ask about this property</Text>
              {propertyData?.address && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {propertyData.address}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Chat */}
        <View style={styles.chatContainer}>
          <CompactChat
            propertyId={propertyId}
            userId={userId}
            systemPrompt={systemPrompt}
            placeholder="Ask about this property..."
            onClose={onClose}
            maxHeight={styles.chatContainer.maxHeight as number}
          />
        </View>
      </View>
    </Modal>
  );
}

// =============================================================================
// Property Chat Button
// =============================================================================

export function PropertyChatButton({
  propertyId,
  propertyData,
  userId,
  variant = 'floating',
  onPress,
}: PropertyChatButtonProps) {
  const router = useRouter();

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to AI chat with property context
      router.push({
        pathname: '/ai-chat',
        params: {
          propertyId,
          propertyAddress: propertyData?.address,
        },
      });
    }
  }, [onPress, router, propertyId, propertyData]);

  if (variant === 'inline') {
    return (
      <TouchableOpacity
        style={styles.inlineButton}
        onPress={handlePress}
      >
        <MessageCircle size={18} color="#fff" />
        <Text style={styles.inlineButtonText}>Ask HAUS</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={handlePress}
    >
      <View style={styles.floatingButtonInner}>
        <Sparkles size={24} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

// =============================================================================
// Inline Property Chat (embedded version)
// =============================================================================

interface InlinePropertyChatProps {
  propertyId: string;
  propertyData?: PropertyChatProps['propertyData'];
  userId?: string;
}

export function InlinePropertyChat({
  propertyId,
  propertyData,
  userId,
}: InlinePropertyChatProps) {
  const systemPrompt = useMemo(() => {
    return `You are HAUS, an AI assistant for Australian real estate.
Currently discussing property: ${propertyData?.address || propertyId}

Property Details:
${propertyData?.suburb ? `- Location: ${propertyData.suburb}` : ''}
${propertyData?.price ? `- Price: ${propertyData.price}` : ''}
${propertyData?.bedrooms ? `- ${propertyData.bedrooms} bed` : ''}
${propertyData?.bathrooms ? `- ${propertyData.bathrooms} bath` : ''}

Provide concise, helpful answers about this property.`;
  }, [propertyId, propertyData]);

  const { messages, isLoading, sendMessage } = useAIChat({
    propertyId,
    userId,
    systemPrompt,
    enableMemory: true,
    enableTools: false,
  });

  return (
    <View style={styles.inlineContainer}>
      <View style={styles.inlineHeader}>
        <Sparkles size={16} color="#666" />
        <Text style={styles.inlineHeaderText}>Ask about this property</Text>
      </View>
      
      <CompactChat
        propertyId={propertyId}
        userId={userId}
        systemPrompt={systemPrompt}
        placeholder="e.g., What's the price history?"
        maxHeight={250}
      />
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    backgroundColor: '#0f0f0f',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
    maxHeight: 600,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 100,
  },
  floatingButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  inlineButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inlineContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  inlineHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
});
