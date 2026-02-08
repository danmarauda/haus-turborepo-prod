---
name: haus-expo-patterns
description: HAUS Platform Expo Router patterns, navigation, UI components, and design tokens. Use when building screens, navigation, or UI components for the HAUS real estate app.
---

# HAUS Expo Patterns

## Project Stack
- Expo 55 + React Native 0.83.1
- Expo Router 7 with Native Tabs API
- React Query + @nkzw/create-context-hook for state
- SF Symbols (iOS) + Material Icons (Android) for native tabs
- lucide-react-native for in-app icons
- expo-image for images

## Design System

### Design Tokens (constants/designTokens.ts)
```typescript
// ALWAYS use design tokens for styling
import { DesignTokens } from '@/constants/designTokens';

// Font - Abel ONLY (no bold weight available)
fontFamily: DesignTokens.fontFamily.primary

// Colors - Dark theme default
backgroundColor: DesignTokens.colors.background // neutral-950
color: DesignTokens.colors.text // white
borderColor: DesignTokens.colors.border // neutral-800
accentColor: DesignTokens.colors.accent // sky-400
```

### Anti-Patterns
```typescript
// ❌ WRONG
fontFamily: 'Abel'
fontWeight: 'bold'  // Abel only has '400'
backgroundColor: '#0a0a0a'

// ✅ CORRECT
fontFamily: DesignTokens.fontFamily.primary
fontWeight: '400'  // Only weight available
backgroundColor: DesignTokens.colors.background
```

## Route Structure

```
app/
├── _layout.tsx              # Root layout (providers)
├── (tabs)/
│   ├── _layout.tsx          # Tab navigation
│   ├── index.tsx            # Home tab
│   ├── search.tsx           # Search tab
│   ├── favorites.tsx        # Favorites tab
│   ├── dashboard.tsx        # Dashboard tab
│   ├── profile.tsx          # Profile tab
│   └── (haus)/              # Nested stack (DESIGN EXEMPLAR)
│       ├── _layout.tsx      # Stack navigation
│       ├── today.tsx        # ⭐ Copy this pattern
│       ├── academy.tsx
│       └── [id].tsx         # Dynamic routes
└── property/
    ├── _layout.tsx
    └── [id].tsx             # Property detail
```

## Screen Template (copy from today.tsx)

```typescript
import { View, Text, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { DesignTokens } from '@/constants/designTokens';

export default function MyScreen() {
  const router = useRouter();
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Screen Title',
          headerStyle: { backgroundColor: DesignTokens.colors.background },
          headerTintColor: DesignTokens.colors.text,
        }} 
      />
      <ScrollView 
        style={{ flex: 1, backgroundColor: DesignTokens.colors.background }}
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        <View style={{ 
          backgroundColor: DesignTokens.colors.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: DesignTokens.colors.border,
          padding: 16,
        }}>
          <Text style={{ 
            fontFamily: DesignTokens.fontFamily.primary,
            color: DesignTokens.colors.text,
            fontSize: 18,
          }}>
            Content
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
```

## Navigation Patterns

```typescript
// Navigate with expo-router
import { useRouter, Link } from 'expo-router';

const router = useRouter();

// Push to route
router.push('/property/123');
router.push({ pathname: '/property/[id]', params: { id: '123' } });

// Replace current
router.replace('/search');

// Go back
router.back();

// Link component
<Link href="/property/123" asChild>
  <Pressable>...</Pressable>
</Link>
```

## Dynamic Routes

```typescript
// app/property/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function PropertyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Use id to fetch property data
}
```

## Image Handling

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: property.imageUrl }}
  style={{ width: '100%', height: 200, borderRadius: 12 }}
  contentFit="cover"
  placeholder={blurhash}
  transition={300}
/>
```

## Icons

```typescript
import { Home, Search, Heart, User } from 'lucide-react-native';

<Home 
  size={24} 
  color={DesignTokens.colors.accent} 
  strokeWidth={1.5}
/>
```

## Provider Hierarchy

```typescript
// app/_layout.tsx
<ErrorBoundary>
  <trpc.Provider>
    <QueryClientProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <RealtimeFiltersProvider>
            <GestureHandlerRootView>
              <Stack />
            </GestureHandlerRootView>
          </RealtimeFiltersProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </trpc.Provider>
</ErrorBoundary>
```

## Common Components

### PropertyCard
```typescript
import { PropertyCard } from '@/components/PropertyCard';

<PropertyCard 
  property={property}
  onPress={() => router.push(`/property/${property.id}`)}
/>
```

### LoadingSpinner
```typescript
import { LoadingSpinner } from '@/components/LoadingSpinner';

{isLoading && <LoadingSpinner />}
```

### EmptyState
```typescript
import { EmptyState } from '@/components/EmptyState';

{items.length === 0 && (
  <EmptyState 
    title="No properties found"
    description="Try adjusting your search"
  />
)}
```
