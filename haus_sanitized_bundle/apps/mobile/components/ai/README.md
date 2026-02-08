# AI Chat Components

This directory contains AI chat components for the HAUS mobile app, integrated with Convex backend and Cortex memory.

## Components

### ChatContainer

Main chat container component with full functionality.

```tsx
import { ChatContainer } from '@/components/ai';

function MyScreen() {
  return (
    <ChatContainer
      userId="user-123"
      propertyId="prop-456"
      enableMemory={true}
      enableTools={true}
      onSwitchToVoice={() => router.push('/voice')}
      onPropertySelect={(id) => router.push(`/property/${id}`)}
    />
  );
}
```

### CompactChat

Compact chat variant for embedding in other screens.

```tsx
import { CompactChat } from '@/components/ai';

function PropertyDetail() {
  return (
    <CompactChat
      propertyId="prop-123"
      placeholder="Ask about this property..."
      maxHeight={300}
    />
  );
}
```

### PropertyChat

Modal chat component for property-specific inquiries.

```tsx
import { PropertyChat, PropertyChatButton } from '@/components/ai/PropertyChat';

function PropertyScreen() {
  const [chatVisible, setChatVisible] = useState(false);
  
  return (
    <>
      <PropertyChatButton
        propertyId="prop-123"
        onPress={() => setChatVisible(true)}
      />
      
      <PropertyChat
        propertyId="prop-123"
        propertyData={{ address: '123 Main St', suburb: 'Richmond' }}
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
      />
    </>
  );
}
```

## Hooks

### useAIChat

Main hook for AI chat functionality.

```tsx
import { useAIChat } from '@/hooks/useAIChat';

function MyComponent() {
  const {
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    sendMessage,
    clearMessages,
  } = useAIChat({
    propertyId: 'prop-123',
    enableMemory: true,
    enableTools: true,
  });
  
  // Use in your component
}
```

### usePropertyAnalysis

Hook for analyzing property images.

```tsx
import { usePropertyAnalysis } from '@/hooks/useAIChat';

function ImageAnalyzer() {
  const { analyzeProperty, isAnalyzing } = usePropertyAnalysis();
  
  const handleAnalyze = async (imageBase64: string) => {
    const result = await analyzeProperty(imageBase64);
    // Handle result
  };
}
```

### useMarketInsights

Hook for getting market insights.

```tsx
import { useMarketInsights } from '@/hooks/useAIChat';

function MarketInsights() {
  const { getInsights, isLoading } = useMarketInsights();
  
  const loadInsights = async () => {
    const insights = await getInsights('Richmond', 'house');
    // Handle insights
  };
}
```

## Convex Actions

The AI chat uses the following Convex actions:

- `api.ai.chat` - Basic chat completion
- `api.ai.chatWithTools` - Chat with tool calling
- `api.ai.analyzeProperty` - Property image analysis
- `api.ai.summarizeProperty` - Quick property summary
- `api.ai.marketInsights` - Market insights for suburbs

## Cortex Memory Integration

All chat interactions are automatically stored in Cortex memory when:
- `enableMemory` is `true`
- A valid `userId` is provided (not 'anonymous-user')

Memory features include:
- Automatic context recall for new conversations
- Property interaction tracking
- Preference learning
- Conversation history

## AI SDK 4.x Compatibility

This implementation uses AI SDK 4.x format:
- Uses `generateText` instead of streaming (streaming simulated client-side)
- Compatible with Convex actions
- Message format adapted for 4.x

## Screens

### AI Chat Tab

Located at `app/(tabs)/ai-chat.tsx`. Provides a dedicated text chat interface.

### Voice Tab Integration

The voice tab (`app/(tabs)/voice.tsx`) includes a button to switch to text chat mode.

## Usage Examples

### Basic Chat

```tsx
<ChatContainer
  userId="user-123"
  suggestions={[
    'Show me properties in Melbourne',
    'What are market trends?',
  ]}
/>
```

### Property-Specific Chat

```tsx
<ChatContainer
  propertyId="prop-123"
  systemPrompt="Focus on investment potential..."
/>
```

### Inline Chat in Property Screen

```tsx
<View style={styles.propertyDetails}>
  {/* Property info */}
  <InlinePropertyChat
    propertyId={property.id}
    propertyData={{
      address: property.address,
      suburb: property.suburb,
      price: property.price,
    }}
  />
</View>
```
