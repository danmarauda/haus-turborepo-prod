# HAUS Platform Migration Analysis

## Executive Summary

This document provides a detailed analysis of the differences between the **Source Project** (`/Users/alias/haus-platform-1` - Expo 55 preview, single app with tRPC/Hono) and the **Target Project** (`/Users/alias/Desktop/haus-voice-search/_external/haus-turborepo-prod` - Expo 54/55, monorepo with Convex-only), along with a step-by-step foundation migration plan.

---

## 1. App.json Configuration Comparison

### Source (haus-platform-1)
```json
{
  "name": "HAUS Australian Real Estate Platform 2025",
  "slug": "derrimut-247",
  "version": "1.0.0",
  "scheme": "myapp",
  "bundleIdentifier": "com.aliaslabs.haus",
  "package": "com.aliaslabs.haus",
  "owner": "aliaslabs"
}
```

### Target (haus-turborepo-prod)
```json
{
  "name": "Haus",
  "slug": "haus-mobile",
  "version": "1.0.0",
  "scheme": "haus",
  "bundleIdentifier": "io.haus.mobile",
  "package": "io.haus.mobile"
}
```

### Key Differences
| Aspect | Source | Target | Migration Action |
|--------|--------|--------|------------------|
| **App Name** | "HAUS Australian Real Estate Platform 2025" | "Haus" | Keep target name or update |
| **Bundle ID (iOS)** | `com.aliaslabs.haus` | `io.haus.mobile` | ⚠️ CRITICAL: Choose one for production |
| **Package (Android)** | `com.aliaslabs.haus` | `io.haus.mobile` | ⚠️ CRITICAL: Choose one for production |
| **Scheme** | `myapp` | `haus` | Update deep linking config |
| **Updates** | ❌ Not configured | ✅ Expo Updates configured | Migrate update config |
| **Notifications** | ❌ Not configured | ✅ Push notifications | Migrate notification config |
| **Localization** | ❌ None | ✅ 4 languages (en/es/fr/pt) | Preserve i18n setup |
| **Sentry** | ❌ Not configured | ✅ Sentry integration | Migrate Sentry config |
| **Web Bundler** | ❌ Not specified | ✅ Metro | Already configured |

### Plugin Differences

| Plugin | Source | Target | Notes |
|--------|--------|--------|-------|
| expo-router | ✅ | ✅ | Same |
| expo-image-picker | ✅ | ✅ | Target has camera permission |
| expo-document-picker | ✅ | ❌ | Source only |
| expo-font | ✅ | ✅ | Same |
| expo-image | ✅ | ❌ | Source only |
| expo-web-browser | ✅ | ❌ | Source only |
| expo-secure-store | ❌ | ✅ | Target only |
| expo-dev-client | ❌ | ✅ | Target only |
| expo-notifications | ❌ | ✅ | Target only |
| expo-apple-authentication | ❌ | ✅ | Target only |
| expo-updates | ❌ | ✅ | Target only |
| @sentry/react-native | ❌ | ✅ | Target only |

---

## 2. Babel & Metro Configuration Comparison

### Babel Config

#### Source
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
  };
};
```

#### Target
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

**Migration Notes:**
- Target uses **NativeWind v4** (required)
- Target has **Reanimated plugin** configured
- Source has `unstable_transformImportMeta` for tRPC compatibility (not needed in target)

### Metro Config

#### Source
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
module.exports = config;
```

#### Target
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo configuration
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

// Workspace package mappings
config.resolver.extraNodeModules = {
  '@v1/backend': path.resolve(monorepoRoot, 'packages/backend'),
  '@v1/ui': path.resolve(monorepoRoot, 'packages/ui'),
  // ... more mappings
};

module.exports = withNativeWind(config, { input: './global.css' });
```

**Migration Notes:**
- Target has **monorepo-aware Metro config**
- Target includes **NativeWind CSS processing**
- Target maps workspace packages (`@v1/*`, `@haus/*`)

---

## 3. Package.json Dependencies Analysis

### Version Differences

| Package | Source | Target | Compatibility |
|---------|--------|--------|---------------|
| **expo** | ~55.0.0-preview.7 | 55.0.0-preview.7 | ✅ Same |
| **react** | 19.2.0 | 19.1.0 | ⚠️ Minor diff |
| **react-native** | 0.83.1 | ~0.81.0 | ⚠️ Source is newer |
| **expo-router** | ~55.0.0-beta.3 | 55.0.0-beta.4 | ⚠️ Beta versions |
| **@tanstack/react-query** | ^5.90.20 | ^5.90.0 | ✅ Compatible |

### Source-Only Dependencies (to remove)
```json
{
  "@ai-sdk/openai": "^3.0.23",           // Version diff
  "@ai-sdk/react": "^3.0.64",            // Version diff  
  "@expo-google-fonts/abel": "^0.4.0",   // Font (migrate if needed)
  "@hono/trpc-server": "^0.4.2",         // REMOVE - tRPC/Hono
  "@trpc/client": "^11.9.0",             // REMOVE - tRPC
  "@trpc/react-query": "^11.9.0",        // REMOVE - tRPC
  "@trpc/server": "^11.9.0",             // REMOVE - tRPC
  "@tanstack/eslint-plugin-query": "^5.91.3", // Dev dependency
  "hono": "^4.11.7",                     // REMOVE - Hono server
  "skills-handler": "^0.1.2",            // REMOVE - Skills
  "superjson": "^2.2.6",                 // REMOVE - tRPC transformer
  "react-native-chart-kit": "^6.12.0",   // Migrate if charts needed
  "react-native-worklets": "~0.7.0"      // Version diff
}
```

### Target-Only Dependencies (to preserve)
```json
{
  "@expo/html-elements": "~0.13.0",
  "@expo/metro-runtime": "~6.1.2",
  "@hookform/resolvers": "^5.2.2",
  "@livekit/components-react": "^2.9.17",     // Voice feature
  "@livekit/react-native": "^2.9.6",          // Voice feature
  "@react-native-community/netinfo": "^11.4.1",
  "@react-navigation/drawer": "^7.3.9",
  "@rn-primitives/*": "^1.2.0",               // UI primitives
  "@stripe/stripe-react-native": "^0.50.3",
  "@supabase/supabase-js": "^2.57.4",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "i18next": "^25.5.2",
  "jose": "^5.9.6",
  "livekit-client": "^2.9.6",                 // Voice feature
  "lottie-react-native": "^7.2.2",
  "nativewind": "^4.2.1",
  "react-hook-form": "^7.63.0",
  "react-i18next": "^15.7.3",
  "react-native-ios-context-menu": "^2.5.3",
  "react-native-ios-utilities": "^4.5.3",
  "react-native-markdown-display": "^7.0.2",
  "react-native-mmkv": "^3.3.3",              // Storage
  "react-native-purchases": "^9.6.12",
  "react-native-toast-message": "^2.3.3",
  "sonner-native": "^0.20.0",
  "tailwind-merge": "^3.3.0",
  "tailwindcss-animate": "^1.0.7",
  "usehooks-ts": "^3.1.0"
}
```

### Version Conflicts to Resolve

| Package | Source | Target | Resolution |
|---------|--------|--------|------------|
| @ai-sdk/react | ^3.0.64 | ^2.0.0 | Upgrade target to v3 |
| ai | ^6.0.62 | ^4.3.0 | Major version diff |
| expo-blur | ~55.0.2 | ~15.0.7 | Expo 55 vs Expo 54 versioning |
| expo-constants | ~55.0.2 | ~18.0.9 | Expo 55 vs Expo 54 versioning |
| expo-haptics | ~55.0.2 | ~15.0.7 | Expo 55 vs Expo 54 versioning |
| expo-image | ~55.0.2 | ~3.0.0 | Major version diff |
| expo-linking | ~55.0.3 | ~8.0.8 | Expo 55 vs Expo 54 versioning |
| expo-location | ~55.0.3 | ❌ | Add if needed |
| expo-splash-screen | ~55.0.2 | ~31.0.10 | Major version diff |
| expo-status-bar | ~55.0.2 | ~3.0.8 | Expo 55 vs Expo 54 versioning |
| expo-system-ui | ~55.0.2 | ~6.0.7 | Expo 55 vs Expo 54 versioning |
| react-native-reanimated | ~4.2.1 | ~4.1.1 | Minor diff |
| react-native-safe-area-context | ~5.6.2 | ~5.6.0 | Minor diff |
| react-native-screens | ~4.20.0 | ~4.16.0 | Minor diff |
| react-native-svg | 15.15.1 | ~15.12.0 | Minor diff |
| react-native-web | ^0.21.2 | ^0.21.0 | Minor diff |
| zod | ^4.3.6 | ^3.25.76 | Major version diff |

---

## 4. Backend Architecture Differences

### Source: tRPC + Hono + Convex (Hybrid)

```
┌─────────────────────────────────────────────────────────────┐
│  Client (Expo)                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   tRPC Client │  │ Convex Fetch │  │ Direct API  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
└─────────┼─────────────────┼────────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│  Hono Server    │  │  Convex (HTTP)  │
│  ├─ tRPC        │  │  ├─ Properties  │
│  ├─ AI Routes   │  │  ├─ Rooms       │
│  └─ Skills      │  │  ├─ Uploads     │
└─────────────────┘  └─────────────────┘
```

**Source Backend Files:**
```
backend/
├── hono.ts                 # Hono server setup
└── trpc/
    ├── app-router.ts       # tRPC router
    ├── create-context.ts   # tRPC context
    └── routes/
        └── ai/
            └── chat/
                └── route.ts  # AI SDK routes

convex/
├── schema.ts               # Simple schema (properties, rooms)
├── http.ts                 # HTTP actions
├── properties.ts           # Property queries
├── rooms.ts                # Collaboration rooms
├── uploads.ts              # File uploads
└── userPreferences.ts      # User prefs
```

### Target: Convex-Only Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Client (Expo)                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           ConvexReactClient (WebSocket)              │  │
│  └──────────────────────────┬───────────────────────────┘  │
└─────────────────────────────┼──────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Convex Backend (packages/backend/convex)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Schema (Cortex Memory + HAUS Auth + Properties)    │   │
│  │  ├─ users (authTables extended)                     │   │
│  │  ├─ conversations (Cortex)                          │   │
│  │  ├─ memories (Cortex vector)                        │   │
│  │  ├─ facts (Cortex)                                  │   │
│  │  ├─ propertyMemories (HAUS-specific)                │   │
│  │  └─ suburbPreferences (HAUS-specific)               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Target Backend Files:**
```
packages/backend/convex/
├── schema.ts              # Comprehensive Cortex + HAUS schema
├── auth.config.ts         # Convex Auth configuration
├── http.ts                # HTTP actions
├── init.ts                # Initialization
├── users.ts               # User mutations/queries
├── subscriptions.ts       # Subscription handling
├── cortexSchema.ts        # Cortex types
└── utils/
    └── validators.ts      # Validation utilities
```

### Key Backend Differences

| Feature | Source | Target | Migration Impact |
|---------|--------|--------|------------------|
| **API Layer** | tRPC + Hono | Convex-only | Remove tRPC/Hono, use Convex queries/mutations |
| **AI Integration** | AI SDK 6 via tRPC | Not in Convex yet | Port AI routes to Convex actions |
| **Authentication** | Custom/JWT | @convex-dev/auth | Migrate auth to Convex Auth |
| **Real-time** | Manual polling | Convex live queries | Native real-time subscriptions |
| **File Uploads** | Convex + custom | Convex storage | Similar, may need adjustment |
| **Schema Complexity** | Simple (4 tables) | Complex (15+ tables) | Target has Cortex memory layer |
| **Collaboration** | Basic rooms | Full Cortex memory | Enhanced collaboration features |

---

## 5. Provider Hierarchy Comparison

### Source Provider Stack
```tsx
<ErrorBoundary>
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>           {/* AsyncStorage-based */}
        <FavoritesProvider>     {/* AsyncStorage-based */}
          <RealtimeFiltersProvider>
            <SafeAreaProvider>
              <GestureHandlerRootView>
                {/* App content */}
              </GestureHandlerRootView>
            </SafeAreaProvider>
          </RealtimeFiltersProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </trpc.Provider>
</ErrorBoundary>
```

### Target Provider Stack
```tsx
<GestureHandlerRootView>
  <SafeAreaProvider>
    <ThemeProvider>               {/* MMKV-based + NativeWind */}
      <QueryClientProvider client={queryClient}>
        <ConvexProvider client={convex}>
          <AuthProvider>          {/* Convex Auth */}
            <RevenueCatProvider>  {/* Subscription sync */}
              <ExpoStripeProvider>
                {/* App content */}
              </ExpoStripeProvider>
            </RevenueCatProvider>
          </AuthProvider>
        </ConvexProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </SafeAreaProvider>
</GestureHandlerRootView>
```

### Provider Migration Mapping

| Source Provider | Target Provider | Notes |
|-----------------|-----------------|-------|
| `ErrorBoundary` | Sentry integration | Target uses Sentry for error tracking |
| `trpc.Provider` | `ConvexProvider` | Remove tRPC, use Convex |
| `QueryClientProvider` | `QueryClientProvider` | Same, but different cache persistence |
| `ThemeProvider` | `ThemeProvider` | Rewrite: AsyncStorage → MMKV |
| `FavoritesProvider` | Not in target | Port to MMKV-based favorites |
| `RealtimeFiltersProvider` | Not in target | Port if needed |
| ❌ None | `AuthProvider` | Add Convex Auth |
| ❌ None | `RevenueCatProvider` | Add subscription management |
| ❌ None | `ExpoStripeProvider` | Add payments |

---

## 6. Storage Layer Comparison

### Source: AsyncStorage
```typescript
// Theme persistence
AsyncStorage.getItem("theme")
AsyncStorage.setItem("theme", newTheme)

// Favorites persistence  
AsyncStorage.getItem("favorites")
AsyncStorage.setItem("favorites", JSON.stringify(newFavorites))
```

### Target: MMKV (5 isolated instances)
```typescript
// apps/mobile/lib/storage/index.ts
export const storage = {
  app: new MMKV({ id: 'app' }),
  cache: new MMKV({ id: 'cache' }),
  auth: new MMKV({ id: 'auth' }),
  state: new MMKV({ id: 'state' }),
  prefs: new MMKV({ id: 'prefs' }),
};

// Theme uses MMKV directly
const storage = new MMKV();
storage.set('theme_mode', theme);
storage.getString('theme_mode');

// React Query cache persistence
export const persistQueryCache = () => { /* MMKV-based */ }
export const restoreQueryCache = () => { /* MMKV-based */ }
```

---

## 7. Styling Comparison

### Source: Custom Design Tokens
```typescript
// constants/designTokens.ts
export const DesignTokens = {
  fontFamily: { primary: 'Abel' },
  colors: { sky: { 50: '#f0f9ff', ... }, ... },
  spacing: { xs: 4, sm: 8, ... },
  shadows: { sm: {...}, md: {...} },
  components: { card: {...}, button: {...} }
};

// Usage
import { DesignTokens } from '@/constants/designTokens';
style={{ 
  backgroundColor: DesignTokens.colors.neutral[950],
  padding: DesignTokens.spacing.md 
}}
```

### Target: NativeWind v4 + Tailwind
```typescript
// global.css
@tailwind base;
@tailwind components;
@tailwind utilities;

// lib/constants/colors.ts
export const themes = {
  light: vars({ '--background': '0 0% 100%', ... }),
  dark: vars({ '--background': '20 14.3% 4.1%', ... })
};

// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { extend: { colors: { ... } } }
};

// Usage
import { vars } from 'nativewind';
className="bg-background text-foreground p-4 rounded-lg"
```

---

## 8. Step-by-Step Foundation Migration Plan

### Phase 1: Project Structure Setup

#### Step 1.1: Consolidate Package Dependencies
```bash
# In target project, update package.json
# Remove source-specific dependencies:
- @hono/trpc-server
- @trpc/client
- @trpc/react-query  
- @trpc/server
- hono
- skills-handler
- superjson

# Update version conflicts (see section 3)
# Keep target's MMKV, NativeWind, Convex setup
```

#### Step 1.2: Update tsconfig.json Path Mappings
```json
// Current target (already has):
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@haus/backend/*": ["../../packages/backend/*"]
    }
  }
}

// May need to add for migrated components:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@haus/backend/*": ["../../packages/backend/*"],
      "@/components/*": ["./components/*"],
      "@/hooks/*": ["./hooks/*"]
    }
  }
}
```

### Phase 2: Backend Migration (tRPC/Hono → Convex)

#### Step 2.1: Port AI Routes to Convex
```typescript
// Current source: backend/trpc/routes/ai/chat/route.ts
// Needs to become: packages/backend/convex/ai.ts

import { action } from "./_generated/server";
import { v } from "convex/values";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const chat = action({
  args: {
    messages: v.array(v.any()),
    systemPrompt: v.optional(v.string()),
  },
  returns: v.object({ text: v.string() }),
  handler: async (ctx, args) => {
    const result = await streamText({
      model: openai("gpt-4o"),
      messages: args.messages,
    });
    // Handle streaming in Convex...
  },
});
```

#### Step 2.2: Migrate Schema (if needed)
```typescript
// Source has simple schema - target has Cortex
// Decide: extend target schema or keep separate?

// Option A: Add source-specific tables to target schema
// In packages/backend/convex/schema.ts:
properties: defineTable({
  // ... from source schema
}),

// Option B: Use target's existing propertyMemories, suburbPreferences
// (Recommended - target has more advanced schema)
```

#### Step 2.3: Update API Calls
```typescript
// BEFORE (source with tRPC):
const mutation = trpc.ai.chat.useMutation();
mutation.mutate({ messages: [...] });

// AFTER (target with Convex):
import { useAction } from "convex/react";
import { api } from "@haus/backend/convex/_generated/api";

const chat = useAction(api.ai.chat);
await chat({ messages: [...] });
```

### Phase 3: Storage Migration (AsyncStorage → MMKV)

#### Step 3.1: Port FavoritesProvider
```typescript
// Create: apps/mobile/context/FavoritesContext.tsx
// Based on: haus-platform-1/hooks/useFavorites.ts

import { MMKV } from 'react-native-mmkv';
const favoritesStorage = new MMKV({ id: 'favorites' });

export const FavoritesProvider = ({ children }) => {
  // Same logic as source, but with MMKV instead of AsyncStorage
};
```

#### Step 3.2: Data Migration Strategy
```typescript
// One-time migration function for existing users
export const migrateAsyncStorageToMMKV = async () => {
  const keys = ['favorites', 'theme', 'userPreferences'];
  
  for (const key of keys) {
    const oldValue = await AsyncStorage.getItem(key);
    if (oldValue) {
      storage.prefs.set(key, JSON.parse(oldValue));
      await AsyncStorage.removeItem(key);
    }
  }
};
```

### Phase 4: Provider Hierarchy Migration

#### Step 4.1: Update Root Layout
```tsx
// apps/mobile/app/_layout.tsx
// Merge target's structure with source's error handling

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <ConvexProvider client={convex}>
              <AuthProvider>
                <RevenueCatProvider>
                  <ExpoStripeProvider>
                    {/* Add FavoritesProvider here */}
                    <FavoritesProvider>
                      <RootLayoutContent />
                    </FavoritesProvider>
                  </ExpoStripeProvider>
                </RevenueCatProvider>
              </AuthProvider>
            </ConvexProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

#### Step 4.2: Port ErrorBoundary
```tsx
// Create: apps/mobile/components/ErrorBoundary.tsx
// Based on: haus-platform-1/components/ErrorBoundary.tsx
// Integrate with Sentry if configured
```

### Phase 5: Styling Migration

#### Step 5.1: Create Design Token Bridge (Optional)
```typescript
// lib/constants/designTokens.ts (temporary bridge)
import { themes } from './colors';

// Map source design tokens to NativeWind classes
export const DesignTokenClasses = {
  card: 'bg-card border border-border rounded-xl p-4',
  button: {
    primary: 'bg-primary text-primary-foreground rounded-lg px-4 py-2',
    secondary: 'bg-secondary text-secondary-foreground rounded-lg px-4 py-2',
  }
};
```

#### Step 5.2: Gradual Migration Strategy
1. **Phase 5.2.1**: Keep source components using StyleSheet
2. **Phase 5.2.2**: Wrap with NativeWind where needed
3. **Phase 5.2.3**: Migrate component by component to Tailwind classes

### Phase 6: Component Migration

#### Step 6.1: Port Core Components
| Source Component | Target Location | Notes |
|------------------|-----------------|-------|
| `components/PropertyCard.tsx` | `components/property/PropertyCard.tsx` | Adapt styling |
| `components/PropertyList.tsx` | `components/property/PropertyList.tsx` | Adapt to Convex |
| `components/SearchBar.tsx` | `components/search/SearchBar.tsx` | Keep functionality |
| `components/FilterButton.tsx` | `components/search/FilterButton.tsx` | NativeWind styling |
| `components/SplashScreen.tsx` | `components/SplashScreen.tsx` | Merge with target's |
| `components/ErrorBoundary.tsx` | `components/ErrorBoundary.tsx` | Add Sentry |

#### Step 6.2: Port Screen Components
| Source Screen | Target Location | Notes |
|---------------|-----------------|-------|
| `app/(tabs)/favorites.tsx` | `app/(tabs)/favorites.tsx` | Use MMKV favorites |
| `app/(tabs)/search.tsx` | `app/(tabs)/search.tsx` | Adapt to Convex |
| `app/property/[id].tsx` | `app/property/[id].tsx` | Update data fetching |
| `app/(tabs)/(haus)/*` | `app/(tabs)/` | Merge into tab structure |

### Phase 7: Feature Migration

#### Step 7.1: AI Chat Migration
```typescript
// Source: Uses tRPC + AI SDK 6
// Target: Needs Convex action + AI SDK

// Create: apps/mobile/hooks/useAIChat.ts
// - Port streaming logic from tRPC to Convex
// - Adapt for React Native environment
```

#### Step 7.2: Voice Features
```typescript
// Target already has LiveKit integration
// Source may have different voice implementation
// Keep target's LiveKit, merge any unique source features
```

### Phase 8: Testing & Validation

#### Step 8.1: Unit Tests
```bash
# Test storage migration
# Test provider hierarchy
# Test Convex queries/mutations
```

#### Step 8.2: E2E Tests
```bash
# Run Maestro tests
maestro test .maestro/smoke-test.yaml

# Test specific flows
maestro test .maestro/04-tabs.yaml
```

---

## 9. File Mapping Reference

### Source → Target File Mappings

#### Configuration Files
| Source | Target | Action |
|--------|--------|--------|
| `app.json` | `apps/mobile/app.json` | Merge carefully (bundle IDs!) |
| `babel.config.js` | `apps/mobile/babel.config.js` | Keep target's (NativeWind) |
| `metro.config.js` | `apps/mobile/metro.config.js` | Keep target's (monorepo) |
| `tsconfig.json` | `apps/mobile/tsconfig.json` | Merge paths |
| `package.json` | `apps/mobile/package.json` | Merge dependencies |

#### Backend Files
| Source | Target | Action |
|--------|--------|--------|
| `backend/hono.ts` | ❌ | Remove (use Convex) |
| `backend/trpc/*` | `packages/backend/convex/*` | Port to Convex |
| `convex/schema.ts` | `packages/backend/convex/schema.ts` | Merge/extend target |
| `lib/trpc.ts` | ❌ | Remove |
| `lib/api-url.ts` | ❌ | Remove |
| `lib/convex.ts` | `apps/mobile/lib/convex.ts` | Keep target's |

#### Provider Files
| Source | Target | Action |
|--------|--------|--------|
| `providers/ThemeProvider.tsx` | `context/ThemeContext.tsx` | Port features to MMKV |
| `providers/RealtimeFiltersProvider.tsx` | `context/*` | Port if needed |
| `hooks/useFavorites.ts` | `context/FavoritesContext.tsx` | Port to MMKV |
| `components/ErrorBoundary.tsx` | `components/ErrorBoundary.tsx` | Add Sentry integration |

#### Constants & Styling
| Source | Target | Action |
|--------|--------|--------|
| `constants/designTokens.ts` | `lib/constants/colors.ts` | Map to NativeWind |
| `constants/theme.ts` | `lib/constants/colors.ts` | Merge with target |
| `constants/colors.ts` | `lib/constants/colors.ts` | Merge |

#### Utility Files
| Source | Target | Action |
|--------|--------|--------|
| `lib/polyfills.ts` | `lib/polyfills.ts` | Port (AI SDK needs) |
| `lib/utils.ts` | `lib/utils.ts` | Merge if exists |

---

## 10. Risk Assessment

### High Risk
| Risk | Mitigation |
|------|------------|
| Bundle ID conflict | Choose one: `com.aliaslabs.haus` or `io.haus.mobile` |
| tRPC → Convex API changes | Thorough testing of all data fetching |
| AsyncStorage → MMKV data loss | Migration script for existing users |
| React Native 0.83 → 0.81 downgrade | Test all native modules |

### Medium Risk
| Risk | Mitigation |
|------|------------|
| Design token migration | Gradual migration, keep both systems temporarily |
| AI SDK version differences | Test AI features thoroughly |
| Provider hierarchy changes | Unit test each provider |

### Low Risk
| Risk | Mitigation |
|------|------------|
| Font changes (Abel) | Configure in target if needed |
| Expo plugin differences | Install missing plugins |

---

## 11. Migration Checklist

### Pre-Migration
- [ ] Backup source project
- [ ] Document current API endpoints
- [ ] Export Convex data (if any)
- [ ] Create feature parity matrix

### During Migration
- [ ] Phase 1: Project structure
- [ ] Phase 2: Backend migration
- [ ] Phase 3: Storage migration
- [ ] Phase 4: Provider hierarchy
- [ ] Phase 5: Styling migration
- [ ] Phase 6: Component migration
- [ ] Phase 7: Feature migration
- [ ] Phase 8: Testing

### Post-Migration
- [ ] Run full test suite
- [ ] Test on iOS device/simulator
- [ ] Test on Android device/emulator
- [ ] Verify MMKV persistence
- [ ] Verify Convex subscriptions
- [ ] Test AI features
- [ ] Test voice features
- [ ] Test payments (if applicable)
- [ ] Update documentation

---

## Appendix A: Dependency Resolution Table

```json
{
  "dependencies": {
    "@ai-sdk/react": "^3.0.64",
    "@ai-sdk/ui-utils": "^0.0.50",
    "@expo-google-fonts/abel": "^0.4.0",
    "@expo/html-elements": "~0.13.0",
    "@expo/metro-runtime": "~6.1.2",
    "@expo/server": "^0.4.4",
    "@expo/vector-icons": "^15.0.3",
    "@hookform/resolvers": "^5.2.2",
    "@livekit/components-react": "^2.9.17",
    "@livekit/react-native": "^2.9.6",
    "@react-native-async-storage/async-storage": "^2.2.0",
    "@react-native-community/netinfo": "^11.4.1",
    "@react-navigation/drawer": "^7.3.9",
    "@rn-primitives/avatar": "^1.2.0",
    "@rn-primitives/checkbox": "^1.2.0",
    "@rn-primitives/dialog": "^1.2.0",
    "@rn-primitives/label": "^1.2.0",
    "@rn-primitives/slot": "^1.2.0",
    "@rn-primitives/tabs": "^1.2.0",
    "@sentry/react-native": "~7.2.0",
    "@stardazed/streams-text-encoding": "^1.0.2",
    "@stripe/stripe-react-native": "^0.50.3",
    "@supabase/supabase-js": "^2.57.4",
    "@tanstack/react-query": "^5.90.0",
    "@ungap/structured-clone": "^1.3.0",
    "ai": "^6.0.62",
    "base64-arraybuffer": "^1.0.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "convex": "^1.31.7",
    "expo": "55.0.0-preview.7",
    "expo-apple-authentication": "~8.0.7",
    "expo-asset": "~11.0.5",
    "expo-blur": "~55.0.2",
    "expo-clipboard": "~8.0.7",
    "expo-constants": "~55.0.2",
    "expo-dev-client": "~6.0.15",
    "expo-device": "~8.0.9",
    "expo-doctor": "^1.17.8",
    "expo-document-picker": "~55.0.2",
    "expo-file-system": "~55.0.2",
    "expo-font": "~55.0.2",
    "expo-glass-effect": "~0.1.4",
    "expo-haptics": "~55.0.2",
    "expo-image": "~55.0.2",
    "expo-image-picker": "~55.0.2",
    "expo-linear-gradient": "~55.0.2",
    "expo-linking": "~55.0.3",
    "expo-localization": "~17.0.7",
    "expo-location": "~55.0.3",
    "expo-notifications": "~0.32.12",
    "expo-router": "55.0.0-beta.4",
    "expo-secure-store": "~14.0.1",
    "expo-splash-screen": "~55.0.2",
    "expo-status-bar": "~55.0.2",
    "expo-system-ui": "~55.0.2",
    "expo-updates": "~29.0.12",
    "expo-web-browser": "~55.0.2",
    "i18next": "^25.5.2",
    "jose": "^5.9.6",
    "livekit-client": "^2.9.6",
    "lottie-react-native": "^7.2.2",
    "lucide-react-native": "^0.563.0",
    "nativewind": "^4.2.1",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "react-hook-form": "^7.63.0",
    "react-i18next": "^15.7.3",
    "react-native": "0.83.1",
    "react-native-chart-kit": "^6.12.0",
    "react-native-gesture-handler": "~2.30.0",
    "react-native-ios-context-menu": "^2.5.3",
    "react-native-ios-utilities": "^4.5.3",
    "react-native-markdown-display": "^7.0.2",
    "react-native-mmkv": "^3.3.3",
    "react-native-purchases": "^9.6.12",
    "react-native-reanimated": "~4.2.1",
    "react-native-safe-area-context": "~5.6.2",
    "react-native-screens": "~4.20.0",
    "react-native-svg": "15.15.1",
    "react-native-toast-message": "^2.3.3",
    "react-native-url-polyfill": "^2.0.0",
    "react-native-web": "^0.21.2",
    "react-native-webview": "^13.13.5",
    "react-native-worklets": "~0.7.0",
    "sonner-native": "^0.20.0",
    "tailwind-merge": "^3.3.0",
    "tailwindcss-animate": "^1.0.7",
    "usehooks-ts": "^3.1.0",
    "zod": "^4.3.6",
    "zustand": "^5.0.10"
  }
}
```

---

*Generated: 2026-01-31*
*Migration complexity: High*
*Estimated effort: 2-3 weeks*
