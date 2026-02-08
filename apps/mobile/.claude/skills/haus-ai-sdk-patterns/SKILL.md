---
name: haus-ai-sdk-patterns
description: HAUS Platform AI SDK 6 patterns for property analysis, streaming chat, and tRPC AI routes. Use when implementing AI features like property analysis or chat.
---

# HAUS AI SDK 6 Patterns

## Project Setup

### Dependencies
- `ai` (AI SDK v6) - Core AI functionality
- `@ai-sdk/openai` - OpenAI provider
- `@ai-sdk/react` - React hooks (useChat, etc.)
- Polyfills for React Native streaming

### Files
- `backend/trpc/routes/ai/chat/route.ts` - Main AI endpoints
- `backend/trpc/routes/ai/generate-text/route.ts` - Legacy text generation
- `hooks/usePropertyChat.ts` - Custom chat hooks
- `lib/polyfills.ts` - AI SDK polyfills for React Native
- `lib/api-url.ts` - API URL generation utilities
- `types/polyfills.d.ts` - Type declarations for polyfills

### Available AI Routes (via tRPC)
- `ai.chat` - Streaming chat with property context
- `ai.analyzeProperty` - Structured property image analysis
- `ai.summarizeProperty` - Quick 3-bullet property summary
- `ai.marketInsights` - Suburb market analysis
- `ai.generateText` - Legacy text generation

## tRPC AI Route

```typescript
// backend/trpc/routes/ai/generate-text/route.ts
import { z } from 'zod';
import { router, publicProcedure } from '@/backend/trpc/create-context';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const aiRouter = router({
  generateText: publicProcedure
    .input(z.object({
      prompt: z.string(),
      systemPrompt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await streamText({
        model: openai('gpt-4o'),
        system: input.systemPrompt ?? 'You are a helpful real estate assistant.',
        prompt: input.prompt,
      });
      
      return result.toDataStreamResponse();
    }),
    
  analyzeProperty: publicProcedure
    .input(z.object({
      imageUrl: z.string(),
      propertyType: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await generateText({
        model: openai('gpt-4o'),
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this property image and provide details about condition, features, and estimated value range.' },
              { type: 'image', image: input.imageUrl },
            ],
          },
        ],
      });
      
      return result.text;
    }),
});
```

## Streaming Chat Component

```typescript
// components/PropertyChat.tsx
import { useChat } from '@ai-sdk/react';

export function PropertyChat({ propertyId }: { propertyId: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { propertyId },
  });
  
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        {messages.map((message) => (
          <View 
            key={message.id}
            style={{
              padding: 12,
              backgroundColor: message.role === 'user' 
                ? DesignTokens.colors.accent 
                : DesignTokens.colors.card,
              borderRadius: 12,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: DesignTokens.colors.text }}>
              {message.content}
            </Text>
          </View>
        ))}
        {isLoading && <LoadingSpinner />}
      </ScrollView>
      
      <View style={{ flexDirection: 'row', padding: 16 }}>
        <TextInput
          value={input}
          onChangeText={(text) => handleInputChange({ target: { value: text } } as any)}
          placeholder="Ask about this property..."
          style={{ 
            flex: 1, 
            backgroundColor: DesignTokens.colors.card,
            borderRadius: 8,
            padding: 12,
            color: DesignTokens.colors.text,
          }}
        />
        <Pressable onPress={handleSubmit} disabled={isLoading}>
          <Send size={24} color={DesignTokens.colors.accent} />
        </Pressable>
      </View>
    </View>
  );
}
```

## Image Analysis with Gemini

```typescript
// For Gemini via AI SDK
import { google } from '@ai-sdk/google';

export async function analyzePropertyImage(imageUrl: string) {
  const result = await generateText({
    model: google('gemini-1.5-pro'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this property image and provide:
1. Property type (house, apartment, townhouse)
2. Estimated number of bedrooms/bathrooms
3. Notable features
4. Condition assessment
5. Estimated price range for Melbourne, AU market`,
          },
          { type: 'image', image: imageUrl },
        ],
      },
    ],
  });
  
  return result.text;
}
```

## Structured Output

```typescript
import { generateObject } from 'ai';
import { z } from 'zod';

const PropertyAnalysisSchema = z.object({
  propertyType: z.enum(['house', 'apartment', 'townhouse']),
  bedrooms: z.number(),
  bathrooms: z.number(),
  features: z.array(z.string()),
  condition: z.enum(['excellent', 'good', 'fair', 'needs work']),
  estimatedPriceRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
  description: z.string(),
});

export async function analyzePropertyStructured(imageUrl: string) {
  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: PropertyAnalysisSchema,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this property image for the Melbourne, AU market.' },
          { type: 'image', image: imageUrl },
        ],
      },
    ],
  });
  
  return result.object;
}
```

## Upload → Analyze Flow

```typescript
// app/(tabs)/(haus)/upload.tsx
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function UploadScreen() {
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
  const saveUpload = useMutation(api.uploads.create);
  const analyzeUpload = useMutation(api.uploads.analyzeWithGemini);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleUpload = async () => {
    // Pick image
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    
    if (pickerResult.canceled) return;
    
    // Get upload URL from Convex
    const uploadUrl = await generateUploadUrl();
    
    // Upload to Convex storage
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'image/jpeg' },
      body: await fetch(pickerResult.assets[0].uri).then(r => r.blob()),
    });
    
    const { storageId } = await response.json();
    
    // Save upload record
    const uploadId = await saveUpload({
      userId: 'current-user',
      storageId,
      status: 'pending',
    });
    
    // Trigger analysis
    setIsAnalyzing(true);
    const analysisResult = await analyzeUpload({ uploadId });
    setResult(analysisResult);
    setIsAnalyzing(false);
  };
  
  return (
    <View>
      <Pressable onPress={handleUpload}>
        <Text>Upload Property Image</Text>
      </Pressable>
      {isAnalyzing && <LoadingSpinner />}
      {result && <AnalysisResults data={result} />}
    </View>
  );
}
```

## tRPC Client Usage

```typescript
// Using tRPC for AI calls
import { trpc } from '@/lib/trpc';

function usePropertyAnalysis() {
  const mutation = trpc.ai.analyzeProperty.useMutation();
  
  const analyze = async (imageUrl: string) => {
    const result = await mutation.mutateAsync({ imageUrl });
    return result;
  };
  
  return {
    analyze,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
```

## Error Handling

```typescript
try {
  const result = await generateText({
    model: openai('gpt-4o'),
    prompt: input,
  });
  return result.text;
} catch (error) {
  if (error instanceof AIError) {
    if (error.code === 'rate_limit_exceeded') {
      // Retry with backoff
    } else if (error.code === 'context_length_exceeded') {
      // Reduce input size
    }
  }
  throw error;
}
```

## Best Practices

1. **Use structured output** (generateObject) for predictable data
2. **Stream for long responses** to improve UX
3. **Handle errors gracefully** with user-friendly messages
4. **Cache analysis results** in Convex
5. **Use system prompts** to set context
6. **Validate inputs** with Zod before sending to AI
