/**
 * PropertyChatExample - Example integration of AI chat in property detail screen
 *
 * This file demonstrates how to integrate the AI chat components
 * into a property detail screen.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Sparkles, MessageCircle, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PropertyChat, PropertyChatButton } from './PropertyChat';
import { CompactChat } from './ChatContainer';
import { useProperty } from '../../hooks/useProperties';

const { width } = Dimensions.get('window');

// =============================================================================
// Example 1: Modal Chat on Property Detail Screen
// =============================================================================

export function PropertyDetailWithModalChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chatVisible, setChatVisible] = useState(false);
  
  // Get property data (mock or real)
  const { data: property } = useProperty(id);
  
  if (!property) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Property Images */}
        <Image
          source={{ uri: property.images[0] }}
          style={styles.propertyImage}
          resizeMode="cover"
        />
        
        {/* Property Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.price}>
            {property.price.display}
          </Text>
          <Text style={styles.address}>
            {property.location.address}
          </Text>
          <Text style={styles.suburb}>
            {property.location.suburb}, {property.location.state}
          </Text>
          
          {/* Features */}
          <View style={styles.featuresRow}>
            <Text style={styles.feature}>
              {property.features.bedrooms} beds
            </Text>
            <Text style={styles.feature}>
              {property.features.bathrooms} baths
            </Text>
            <Text style={styles.feature}>
              {property.features.parking} parking
            </Text>
          </View>
          
          {/* Description */}
          <Text style={styles.description}>
            {property.description}
          </Text>
        </View>
      </ScrollView>
      
      {/* Floating AI Chat Button */}
      <PropertyChatButton
        propertyId={property.id}
        propertyData={{
          address: property.location.address,
          suburb: property.location.suburb,
          price: property.price.display,
          bedrooms: property.features.bedrooms,
          bathrooms: property.features.bathrooms,
        }}
        variant="floating"
        onPress={() => setChatVisible(true)}
      />
      
      {/* Property Chat Modal */}
      <PropertyChat
        propertyId={property.id}
        propertyData={{
          address: property.location.address,
          suburb: property.location.suburb,
          price: property.price.display,
          bedrooms: property.features.bedrooms,
          bathrooms: property.features.bathrooms,
        }}
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
      />
    </SafeAreaView>
  );
}

// =============================================================================
// Example 2: Inline Chat on Property Detail Screen
// =============================================================================

export function PropertyDetailWithInlineChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showChat, setShowChat] = useState(false);
  
  const { data: property } = useProperty(id);
  
  if (!property) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Property Images */}
        <Image
          source={{ uri: property.images[0] }}
          style={styles.propertyImage}
          resizeMode="cover"
        />
        
        {/* Property Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.price}>
            {property.price.display}
          </Text>
          <Text style={styles.address}>
            {property.location.address}
          </Text>
          
          {/* AI Chat Toggle Button */}
          {!showChat ? (
            <TouchableOpacity
              style={styles.chatToggleButton}
              onPress={() => setShowChat(true)}
            >
              <Sparkles size={20} color="#fff" />
              <Text style={styles.chatToggleText}>
                Ask HAUS about this property
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.inlineChatContainer}>
              <View style={styles.inlineChatHeader}>
                <Text style={styles.inlineChatTitle}>Ask about this property</Text>
                <TouchableOpacity onPress={() => setShowChat(false)}>
                  <X size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <CompactChat
                propertyId={property.id}
                propertyData={{
                  address: property.location.address,
                  suburb: property.location.suburb,
                  price: property.price.display,
                  bedrooms: property.features.bedrooms,
                  bathrooms: property.features.bathrooms,
                }}
                placeholder="e.g., What's the price history?"
                maxHeight={300}
              />
            </View>
          )}
          
          {/* Rest of property details */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {property.description}
          </Text>
          
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresList}>
            {property.features.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================================================================
// Example 3: AI Suggestions Before Chat
// =============================================================================

const AI_SUGGESTIONS = [
  "What's the price history for this area?",
  "How does this compare to similar properties?",
  "What's the rental yield potential?",
  "Tell me about the neighborhood",
];

export function PropertyDetailWithSuggestions() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chatVisible, setChatVisible] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState<string>();
  
  const { data: property } = useProperty(id);
  
  if (!property) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleSuggestionPress = (suggestion: string) => {
    setInitialQuestion(suggestion);
    setChatVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Property Header */}
        <Image
          source={{ uri: property.images[0] }}
          style={styles.propertyImage}
          resizeMode="cover"
        />
        
        <View style={styles.detailsContainer}>
          <Text style={styles.price}>{property.price.display}</Text>
          <Text style={styles.address}>{property.location.address}</Text>
          
          {/* AI Suggestions Section */}
          <View style={styles.suggestionsSection}>
            <View style={styles.suggestionsHeader}>
              <Sparkles size={16} color="#10b981" />
              <Text style={styles.suggestionsTitle}>Ask HAUS</Text>
            </View>
            
            <View style={styles.suggestionsList}>
              {AI_SUGGESTIONS.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <MessageCircle size={14} color="#666" />
                  <Text style={styles.suggestionText} numberOfLines={1}>
                    {suggestion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              style={styles.askAnythingButton}
              onPress={() => setChatVisible(true)}
            >
              <Text style={styles.askAnythingText}>Ask anything else...</Text>
            </TouchableOpacity>
          </View>
          
          {/* Property Details */}
          <Text style={styles.sectionTitle}>About this property</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>
      </ScrollView>
      
      {/* Property Chat Modal with Initial Question */}
      <PropertyChat
        propertyId={property.id}
        propertyData={{
          address: property.location.address,
          suburb: property.location.suburb,
          price: property.price.display,
        }}
        visible={chatVisible}
        onClose={() => {
          setChatVisible(false);
          setInitialQuestion(undefined);
        }}
      />
    </SafeAreaView>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyImage: {
    width: width,
    height: width * 0.7,
  },
  detailsContainer: {
    padding: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  address: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
  },
  suburb: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  feature: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  // Chat toggle button
  chatToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  chatToggleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Inline chat
  inlineChatContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  inlineChatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inlineChatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  // Features list
  featuresList: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  featureBullet: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  featureText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  // Suggestions
  suggestionsSection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  askAnythingButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  askAnythingText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
});
