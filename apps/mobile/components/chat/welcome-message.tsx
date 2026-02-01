import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MessageCircle } from 'lucide-react-native';

interface WelcomeMessageProps {
  suggestions?: string[];
  onSelectSuggestion?: (suggestion: string) => void;
}

export function WelcomeMessage({
  suggestions = [
    'Show me properties in Sydney',
    'What are the current market trends?',
    'Find 3-bedroom houses under $1M',
  ],
  onSelectSuggestion,
}: WelcomeMessageProps) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <MessageCircle size={32} className="text-primary" strokeWidth={2} />
      </View>
      <Text className="mb-2 text-center text-2xl font-bold text-foreground">
        Welcome to Haus
      </Text>
      <Text className="mb-8 text-center text-muted-foreground">
        Ask me anything about Australian real estate
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {suggestions.map((suggestion, index) => (
          <View
            key={index}
            className="rounded-full bg-muted/50 px-4 py-2"
            onStartShouldSetResponder={() => {
              onSelectSuggestion?.(suggestion);
              return true;
            }}
          >
            <Text className="text-sm text-foreground">{suggestion}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
