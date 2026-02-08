# HAUS Cross-Platform Strategy

**Version:** 1.0  
**Date:** 2026-02-02  
**Applies to:** Web (Next.js) + Mobile (Expo/React Native)

---

## 1. PHILOSOPHY

### Core Principles

1. **Single Source of Truth**
   - One Convex backend serves all platforms
   - Shared database schema across Web and Mobile
   - Unified user identity via Convex Auth

2. **Feature Parity**
   - Same features available on both platforms
   - Platform-optimized UI/UX
   - Synchronized user data

3. **Code Sharing**
   - Shared types from `packages/backend`
   - Shared UI primitives in `packages/ui`
   - Shared business logic via custom hooks

4. **Platform-Specific Optimization**
   - Web: Keyboard shortcuts, hover states, larger screens
   - Mobile: Touch gestures, native APIs, offline support

---

## 2. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                         CONVEX BACKEND                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │   Schema    │ │  Functions  │ │  Storage    │               │
│  │  (shared)   │ │  (shared)   │ │  (shared)   │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   apps/app      │ │  apps/mobile    │ │   apps/web      │
│   (Web App)     │ │  (React Native) │ │ (Marketing)     │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ Next.js 16      │ │ Expo 55         │ │ Next.js 16      │
│ React 19        │ │ React Native 83 │ │ React 19        │
│ Tailwind v4     │ │ NativeWind v4   │ │ Tailwind v4     │
│ shadcn/ui       │ │ Custom UI       │ │ shadcn/ui       │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                              ▼
              ┌─────────────────────────────┐
              │     packages/* (Shared)     │
              │  ┌─────────┐ ┌─────────┐   │
              │  │   UI    │ │ Backend │   │
              │  │Analytics│ │ Logger  │   │
              │  └─────────┘ └─────────┘   │
              └─────────────────────────────┘
```

---

## 3. FEATURE PARITY MATRIX

### Legend
- ✅ **Implemented** - Feature exists and is functional
- 🔄 **Partial** - Feature exists but needs enhancement
- ❌ **Missing** - Feature does not exist
- 🚫 **N/A** - Not applicable to platform

### Core Features

| Feature | Web (`apps/app`) | Mobile (`apps/mobile`) | Priority | Notes |
|---------|------------------|------------------------|----------|-------|
| **Authentication** | | | | |
| Google OAuth | ✅ | ✅ | Critical | Via Convex Auth |
| Email/Password | 🔄 | 🔄 | Medium | Add to both |
| Anonymous Auth | ❌ | ❌ | Low | Optional |
| **Property Search** | | | | |
| Text Search | ✅ | ✅ | Critical | |
| Advanced Filters | ✅ | 🔄 | Critical | Mobile needs enhancement |
| Map Search (Compass) | ❌ | ❌ | Critical | Implement on both |
| Suburb Profiles | ❌ | ❌ | High | |
| Saved Searches | ❌ | ❌ | Medium | |
| **Property Display** | | | | |
| Property Cards | ✅ | ✅ | Critical | |
| Property Detail | ✅ | ✅ | Critical | |
| Image Gallery | ✅ | ✅ | High | |
| Virtual Tours | ❌ | ❌ | Medium | |
| Floor Plans | ❌ | ❌ | Low | |
| **AI Features** | | | | |
| Voice Search | ✅ | ✅ | Critical | Different implementations |
| AI Chat | ✅ | ✅ | Critical | |
| Property Analysis | ❌ | ✅ (partial) | High | Mobile has image analysis |
| Voice Navigation | ❌ | ❌ | Medium | |
| **Marketplace** | | | | |
| Browse Providers | ✅ | ✅ | High | |
| Provider Profiles | ❌ | ❌ | High | |
| Request Quotes | ❌ | ❌ | Medium | |
| Provider Dashboard | ❌ | 🚫 | Low | Web-only |
| **Trust & Safety** | | | | |
| DUD Reports | ❌ | ❌ | Medium | |
| Watchdog | ❌ | ❌ | Medium | |
| **Academy** | | | | |
| Course Catalog | ❌ | ✅ | High | |
| Lesson Viewer | ❌ | ✅ | High | |
| Progress Tracking | ❌ | ✅ | Medium | |
| First Home Tools | ❌ | ✅ (partial) | Medium | |
| **User Features** | | | | |
| Profile Management | ✅ | ✅ | Critical | |
| Favorites | ✅ | ✅ | Critical | |
| Document Vault | ❌ | ✅ | High | |
| Collaborative Rooms | ❌ | ❌ | Medium | |
| Messages | ❌ | ❌ | Medium | |
| **Tools** | | | | |
| Mortgage Calculator | ❌ | ✅ | Medium | Mobile in academy |
| Affordability | ❌ | ✅ | Medium | Mobile in academy |
| Pre-approval | ❌ | ❌ | Medium | |
| Property Comparison | ❌ | ❌ | Low | |
| **Notifications** | | | | |
| Push Notifications | 🚫 | ✅ | High | Mobile only |
| Email Notifications | ❌ | ❌ | Medium | |
| In-App Notifications | ❌ | ✅ | Medium | |

---

## 4. SHARED INFRASTRUCTURE

### 4.1 Convex Backend (Shared)

All platforms use the same Convex deployment:

```typescript
// packages/backend/convex/schema.ts
// Single schema for all platforms

export default defineSchema({
  // Auth (via @convex-dev/auth)
  ...authTables,
  
  // Users
  users: defineTable({
    // ... shared user fields
  }),
  
  // Properties
  propertyListings: defineTable({
    // ... shared property schema
  }),
  
  // Cortex Memory
  conversations: defineTable({ /* ... */ }),
  memories: defineTable({ /* ... */ }),
  facts: defineTable({ /* ... */ }),
  
  // Platform-agnostic features
  userPreferences: defineTable({ /* ... */ }),
  collaborativeRooms: defineTable({ /* ... */ }),
  // ... etc
});
```

### 4.2 Shared Types

```typescript
// packages/backend/convex/_generated/dataModel.d.ts
// Auto-generated, used by both platforms

// Custom shared types
types/
├── property.ts       # Property types
├── user.ts           # User types
├── marketplace.ts    # Provider types
├── voice.ts          # Voice/AI types
└── index.ts          # Exports
```

### 4.3 Shared Hooks Pattern

```typescript
// Web: apps/app/src/hooks/useProperty.ts
// Mobile: apps/mobile/hooks/useProperty.ts

// Both use the same Convex query
import { useQuery } from "convex/react";
import { api } from "@v1/backend/convex";

export function useProperty(id: string) {
  return useQuery(api.properties.get, { id });
}
```

---

## 5. COMPONENT SHARING STRATEGY

### 5.1 UI Primitives (Shared Package)

```
packages/ui/src/
├── components/
│   ├── button.tsx        # Radix + Tailwind
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── theme/
│   └── tokens.ts         # Shared design tokens
└── utils/
    └── cn.ts             # Class name utilities
```

**Web Usage:**
```tsx
import { Button } from "@v1/ui/button";
```

**Mobile Usage:**
```tsx
// Mobile uses NativeWind with same class names
import { TouchableOpacity } from "react-native";
// Classes like "bg-primary rounded-lg" work on both
```

### 5.2 Feature Components (Platform-Specific)

**Pattern:** Same feature, platform-optimized implementation

**Example: Property Card**

```tsx
// Web: apps/app/src/components/property-card.tsx
import { Card, Button } from "@v1/ui";
import { useConvex } from "convex/react";

export function PropertyCard({ property }: { property: Property }) {
  // Web-specific: hover states, click handlers
  return (
    <Card className="hover:shadow-lg transition-shadow">
      {/* Web implementation */}
    </Card>
  );
}
```

```tsx
// Mobile: apps/mobile/components/property/PropertyCard.tsx
import { View, TouchableOpacity } from "react-native";
import { useQuery } from "convex/react";

export function PropertyCard({ property }: { property: Property }) {
  // Mobile-specific: swipe gestures, haptic feedback
  return (
    <TouchableOpacity onPress={handlePress}>
      {/* Mobile implementation */}
    </TouchableOpacity>
  );
}
```

### 5.3 Shared Business Logic

```typescript
// packages/backend/convex/properties.ts
// Shared backend logic

export const search = query({
  args: {
    query: v.string(),
    filters: v.object({ /* ... */ }),
  },
  handler: async (ctx, args) => {
    // Same search logic for both platforms
  },
});
```

---

## 6. NATIVE CAPABILITIES

### 6.1 Mobile-First Features

| Feature | Mobile Implementation | Web Fallback |
|---------|----------------------|--------------|
| Push Notifications | Expo Notifications | Email notifications |
| Camera/Photos | Expo Camera/ImagePicker | File input |
| Biometric Auth | Expo LocalAuthentication | Password |
| Haptic Feedback | Expo Haptics | Visual feedback |
| Deep Linking | Expo Linking | URL routing |
| Offline Storage | MMKV + React Query | LocalStorage |
| GPS Location | Expo Location | Browser geolocation |

### 6.2 Web-First Features

| Feature | Web Implementation | Mobile Fallback |
|---------|-------------------|-----------------|
| Keyboard Shortcuts | Native browser | Button shortcuts |
| Hover States | CSS :hover | Long press |
| Right-click Menus | Context menus | Action sheets |
| Multi-window | Browser tabs | Modal stacks |
| Desktop Layouts | Grid layouts | Stack layouts |

---

## 7. STATE MANAGEMENT

### 7.1 Global State (Convex)

```typescript
// Server state - shared across platforms
const properties = useQuery(api.properties.list, { filters });
const user = useQuery(api.users.get, { id: userId });
```

### 7.2 Local State (Platform-Specific)

**Web:**
```typescript
// Zustand for client state
const useSearchStore = create<SearchState>((set) => ({
  filters: {},
  setFilters: (filters) => set({ filters }),
}));
```

**Mobile:**
```typescript
// React Query + MMKV for persistence
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      persister: asyncStoragePersister,
    },
  },
});
```

### 7.3 UI State

```typescript
// Both platforms: React useState/useReducer
const [isExpanded, setIsExpanded] = useState(false);
```

---

## 8. NAVIGATION PATTERNS

### 8.1 Web Navigation

```typescript
// apps/app/src/app/[locale]/
// File-based routing with Next.js App Router

app/
├── [locale]/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home
│   ├── search/
│   │   └── page.tsx         # /search
│   ├── property/
│   │   └── [id]/
│   │       └── page.tsx     # /property/123
│   └── settings/
│       └── page.tsx         # /settings
```

### 8.2 Mobile Navigation

```typescript
// apps/mobile/app/
// File-based routing with Expo Router

app/
├── _layout.tsx              # Root layout
├── (auth)/                  # Auth group
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/                  # Tab navigation
│   ├── _layout.tsx
│   ├── index.tsx            # Home tab
│   ├── search.tsx           # Search tab
│   ├── voice.tsx            # Voice tab
│   ├── favorites.tsx        # Favorites tab
│   └── profile.tsx          # Profile tab
└── property/
    └── [id].tsx             # /property/123
```

### 8.3 Route Mapping

| Feature | Web Route | Mobile Route |
|---------|-----------|--------------|
| Home | `/` | `/(tabs)` |
| Search | `/search` | `/(tabs)/search` |
| Property | `/property/[id]` | `/property/[id]` |
| Profile | `/profile` | `/(tabs)/profile` |
| Settings | `/settings` | `/(tabs)/profile/settings` |
| Academy | `/academy` | `/(tabs)/(haus)/academy` |
| Vault | `/vault` | `/(tabs)/(haus)/vault` |

---

## 9. STYLING STRATEGY

### 9.1 Design Tokens (Shared)

```typescript
// packages/ui/src/theme/tokens.ts
export const tokens = {
  colors: {
    primary: "#ffffff",
    background: "#0a0a0a",
    accent: "#10b981",
    // ... same on both platforms
  },
  spacing: {
    1: "0.25rem",
    2: "0.5rem",
    // ...
  },
  borderRadius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    // ...
  },
};
```

### 9.2 Web Styling (Tailwind v4)

```css
/* apps/app/src/app/globals.css */
@theme inline {
  --color-primary: var(--neutral-100);
  --color-background: var(--neutral-950);
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
}
```

```tsx
// Usage
<div className="bg-background text-primary rounded-lg p-4">
```

### 9.3 Mobile Styling (NativeWind v4)

```typescript
// apps/mobile/tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ffffff",
        background: "#0a0a0a",
      },
    },
  },
};
```

```tsx
// Usage
<View className="bg-background rounded-lg p-4">
```

---

## 10. TESTING STRATEGY

### 10.1 Shared Tests

```typescript
// packages/backend/convex/properties.test.ts
// Backend tests run independently

describe("properties", () => {
  it("should search properties", async () => {
    // Test logic
  });
});
```

### 10.2 Platform-Specific Tests

**Web:**
```typescript
// apps/app/src/components/property-card.test.tsx
import { render, screen } from "@testing-library/react";

describe("PropertyCard", () => {
  it("should render on web", () => {
    // Web-specific test
  });
});
```

**Mobile:**
```typescript
// apps/mobile/components/property/PropertyCard.test.tsx
import { render } from "@testing-library/react-native";

describe("PropertyCard", () => {
  it("should render on mobile", () => {
    // Mobile-specific test
  });
});
```

---

## 11. DEPLOYMENT WORKFLOW

### 11.1 Development

```bash
# Start all platforms
bun dev              # Starts web + backend

# Mobile (separate terminal)
cd apps/mobile
bun dev:ios          # iOS simulator
bun dev:android      # Android emulator
```

### 11.2 Staging

```bash
# Deploy backend
bun run convex:deploy

# Deploy web
vercel --target=preview

# Mobile
# Upload to TestFlight/Play Console
```

### 11.3 Production

| Platform | Deployment | Trigger |
|----------|------------|---------|
| Backend | Convex | `bun run convex:deploy` |
| Web App | Vercel | Git push to `main` |
| Marketing | Vercel | Git push to `main` |
| Mobile | App Store / Play Store | Manual release |

---

## 12. FEATURE IMPLEMENTATION WORKFLOW

### 12.1 New Feature Process

1. **Design Phase**
   - Create platform-agnostic design
   - Identify platform-specific adaptations
   - Update feature parity matrix

2. **Backend Phase**
   - Add Convex schema changes
   - Implement shared functions
   - Write backend tests

3. **Web Implementation**
   - Create/modify pages
   - Implement components with `@v1/ui`
   - Add web-specific optimizations

4. **Mobile Implementation**
   - Create/modify screens
   - Implement components with NativeWind
   - Add native capabilities

5. **Testing**
   - Cross-platform feature testing
   - Sync verification
   - Performance testing

6. **Documentation**
   - Update feature parity matrix
   - Document platform differences
   - Update AGENTS.md

### 12.2 Feature Flag Strategy

```typescript
// Feature flags in Convex
const features = {
  voiceSearch: true,        // Both platforms
  compassMap: true,         // Web first, mobile later
  aiAnalysis: true,         // Both platforms
  marketplace: true,        // Web only initially
  collaborativeRooms: false, // Coming soon
};
```

---

## 13. COMMON PATTERNS

### 13.1 Data Fetching

```typescript
// Same pattern on both platforms
import { useQuery } from "convex/react";
import { api } from "@v1/backend/convex";

function usePropertySearch(filters: SearchFilters) {
  return useQuery(
    api.properties.search,
    filters.query ? { filters } : "skip"
  );
}
```

### 13.2 Mutations

```typescript
// Web
const saveProperty = useMutation(api.properties.save);
await saveProperty({ propertyId });

// Mobile (same API)
const saveProperty = useMutation(api.properties.save);
await saveProperty({ propertyId });
```

### 13.3 Real-time Subscriptions

```typescript
// Both platforms
const room = useQuery(api.rooms.get, { roomId });
// Auto-updates when data changes
```

---

## 14. MIGRATION CHECKLIST

### Per Feature

- [ ] Backend schema updated
- [ ] Convex functions implemented
- [ ] Web implementation complete
- [ ] Mobile implementation complete
- [ ] Feature parity verified
- [ ] Tests written
- [ ] Documentation updated
- [ ] Feature parity matrix updated

---

*End of Cross-Platform Strategy*
