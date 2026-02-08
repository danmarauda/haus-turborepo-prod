# HAUS Migration - Implementation Playbooks

**For:** Multi-Agent Swarm Execution  
**Date:** 2026-02-02  
**Version:** 1.0

---

## SWARM ORGANIZATION

### Agent Specializations

| Agent | Responsibility | Primary Focus |
|-------|---------------|---------------|
| **Backend Agent** | Database & API | Convex schema, functions, integrations |
| **Web Agent** | Next.js App | `apps/app` pages, components, hooks |
| **Mobile Agent** | Expo/React Native | `apps/mobile` screens, components, hooks |
| **UI Agent** | Design System | `packages/ui`, shared components, theming |
| **QA Agent** | Testing & Verification | Tests, validation, parity checking |

---

## PLAYBOOK 1: DATABASE MIGRATION

**Agent:** Backend Agent  
**Duration:** 3-5 days  
**Priority:** CRITICAL

### Step 1: Schema Preparation

```typescript
// packages/backend/convex/schema.ts

// Add these tables in order:

// 1. dudReports (Trust system)
defineTable({
  reportNumber: v.optional(v.number()),
  name: v.string(),
  slug: v.string(),
  category: v.string(),
  // ... complete schema
}).index("by_slug", ["slug"]);

// 2. providers (Marketplace)
defineTable({
  businessName: v.string(),
  slug: v.string(),
  category: v.string(),
  // ... complete schema
}).index("by_slug", ["slug"]);

// 3. compassListings (Map search)
defineTable({
  title: v.string(),
  coordinates: v.object({ lat: v.number(), lng: v.number() }),
  // ... complete schema
}).index("by_coordinates", ["coordinates"]);

// 4. marketCategories
defineTable({
  id: v.string(),
  name: v.string(),
  slug: v.string(),
  // ... complete schema
});

// 5. Gamification tables
// userProgress, achievements, lessons
// 6. Tenders tables
// tenders, tenderDocuments
```

### Step 2: Generate Types

```bash
cd packages/backend
bun run dev  # This will apply schema and generate types
```

### Step 3: Create Convex Functions

```typescript
// packages/backend/convex/dudReports.ts

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dudReports")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const list = query({
  args: { 
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("dudReports");
    if (args.category) {
      q = q.withIndex("by_category", (q) => q.eq("category", args.category));
    }
    return await q.take(args.limit ?? 50);
  },
});

// ... mutations
```

### Step 4: Data Migration (if needed)

```bash
# Export from source
npx convex export --path ./data-export

# Import to target
npx convex import --path ./data-export
```

### Verification Checklist
- [ ] Schema compiles without errors
- [ ] All indexes created
- [ ] Types generated
- [ ] Functions registered
- [ ] Data migrated successfully

---

## PLAYBOOK 2: API ROUTES MIGRATION

**Agent:** Backend Agent  
**Duration:** 2-3 days  
**Priority:** HIGH

### Route Implementation Template

```typescript
// apps/app/src/app/api/[feature]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@v1/backend/convex/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request
    const body = await req.json();
    
    // 3. Call Convex action
    // const result = await fetchConvex("api/feature/action", body);
    
    // 4. Return response
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Routes to Implement

| Route | Method | Purpose | Complexity |
|-------|--------|---------|------------|
| `/api/agent` | POST | Claude agent | HIGH |
| `/api/pica-voice-search` | POST | Pica integration | MEDIUM |
| `/api/cedar-voice` | POST | Cedar voice | MEDIUM |
| `/api/copilot` | POST | Copilot | MEDIUM |
| `/api/listing-ai` | POST | Listing AI | MEDIUM |
| `/api/style-recognition` | POST | Image AI | MEDIUM |
| `/api/market/providers` | GET | Provider list | LOW |
| `/api/dud/reports` | GET | DUD reports | LOW |

---

## PLAYBOOK 3: WEB COMPONENT MIGRATION

**Agent:** Web Agent  
**Duration:** Varies per component  
**Priority:** Varies

### Migration Template

```typescript
// 1. Analyze source component
// Source: components/[feature]/[component].tsx

// 2. Create target structure
// apps/app/src/components/[feature]/[component].tsx

// 3. Adapt imports
// Remove: @/components/ui/* (old structure)
// Use: @v1/ui/* (shared package)

// 4. Adapt to target patterns
// - Use Next.js patterns
// - Adapt for App Router
// - Use shared hooks
```

### Component Migration Steps

#### Step 1: Create Directory Structure
```
apps/app/src/components/[feature]/
├── [component].tsx
├── index.ts (optional barrel export)
└── [component]-test.tsx (optional)
```

#### Step 2: Migrate Component Code

```tsx
"use client"; // If using client features

import { useState } from "react";
import { useQuery } from "convex/react";
import { Button, Card } from "@v1/ui";
import { api } from "@v1/backend/convex";
import { useCortexMemory } from "@/hooks/use-cortex-memory";

interface Props {
  // Define props
}

export function FeatureComponent({}: Props) {
  // Use Convex for data
  const data = useQuery(api.feature.get);
  
  // Use shared hooks
  const cortex = useCortexMemory({ userId });
  
  return (
    <Card className="p-4">
      <Button onClick={handleAction}>Action</Button>
    </Card>
  );
}
```

#### Step 3: Create Page Route

```tsx
// apps/app/src/app/[locale]/[feature]/page.tsx

import { FeatureComponent } from "@/components/[feature]/[component]";

export default function FeaturePage() {
  return (
    <main className="container mx-auto py-8">
      <FeatureComponent />
    </main>
  );
}
```

### Component Priority Queue

1. **CRITICAL** (Week 1)
   - `advanced-search-filters.tsx`
   - `compass-content.tsx`
   - `voice-copilot-modal.tsx` enhancements

2. **HIGH** (Week 2-3)
   - `marketplace-content.tsx`
   - `property-results.tsx`
   - `dud-content.tsx`
   - `academy-content.tsx`

3. **MEDIUM** (Week 4-6)
   - `dashboard-content.tsx`
   - `voice-navigation-*.tsx`
   - `cedar-*.tsx`
   - `ai-elements/*`

4. **LOW** (Week 7+)
   - Demo pages
   - Testing utilities
   - Marketing components

---

## PLAYBOOK 4: MOBILE COMPONENT MIGRATION

**Agent:** Mobile Agent  
**Duration:** Varies per component  
**Priority:** Varies

### Migration Template

```typescript
// apps/mobile/components/[feature]/[Component].tsx

import React from "react";
import { View, Text } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@v1/backend/convex";

interface Props {
  // Define props
}

export function FeatureComponent({}: Props) {
  const data = useQuery(api.feature.get);
  
  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-foreground text-lg">
        Content
      </Text>
    </View>
  );
}
```

### Screen Creation Template

```typescript
// apps/mobile/app/(tabs)/[feature].tsx
// OR
// apps/mobile/app/[feature]/index.tsx

import { Stack } from "expo-router";
import { FeatureComponent } from "@/components/[feature]/FeatureComponent";

export default function FeatureScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Feature" }} />
      <FeatureComponent />
    </>
  );
}
```

### Mobile-Specific Considerations

1. **Navigation**
   - Use Expo Router
   - Add to appropriate tab group
   - Configure stack navigation

2. **Styling**
   - Use NativeWind classes
   - Test on both iOS/Android
   - Handle safe areas

3. **Native Features**
   - Use Expo SDK when possible
   - Add permissions handling
   - Handle platform differences

### Mobile Priority Queue

1. **CRITICAL** (Week 1-2)
   - Compass map view
   - Enhanced search filters

2. **HIGH** (Week 3-4)
   - DUD score display
   - Provider browsing
   - Voice navigation

3. **MEDIUM** (Week 5-6)
   - Quote requests
   - AI analysis enhancements

---

## PLAYBOOK 5: HOOK MIGRATION

**Agent:** Web Agent + Mobile Agent  
**Duration:** 1-2 days  
**Priority:** MEDIUM

### Hook Migration Template

```typescript
// apps/app/src/hooks/use-[feature].ts (Web)
// apps/mobile/hooks/use[Feature].ts (Mobile)

import { useQuery, useMutation } from "convex/react";
import { api } from "@v1/backend/convex";

export function useFeature(args: FeatureArgs) {
  // Query
  const data = useQuery(api.feature.get, args);
  
  // Mutation
  const mutate = useMutation(api.feature.update);
  
  // Actions
  const performAction = async (input: Input) => {
    return await mutate({ ...args, ...input });
  };
  
  return {
    data,
    isLoading: data === undefined,
    performAction,
  };
}
```

### Hooks to Migrate

| Hook | Web | Mobile | Complexity |
|------|-----|--------|------------|
| `use-voice-navigation.ts` | ✅ | ✅ | Medium |
| `use-voice-copilot-integration.ts` | ✅ | ❌ | Medium |
| `use-scribe-realtime.ts` | ✅ | ✅ | High |
| `use-copilot-property-tools.ts` | ✅ | ✅ | Medium |
| `use-gsap-reveal.ts` | ✅ | ❌ | Low (web only) |
| `use-lenis.ts` | ✅ | ❌ | Low (web only) |

---

## PLAYBOOK 6: TESTING & VERIFICATION

**Agent:** QA Agent  
**Duration:** Ongoing  
**Priority:** HIGH

### Testing Checklist per Feature

#### Backend Tests
```typescript
// convex/feature.test.ts
import { test, expect } from "vitest";
import { convexTest } from "convex-test";

const testApi = convexTest(schema);

test("should create record", async () => {
  const result = await testApi.mutation(api.feature.create, {
    data: { /* ... */ }
  });
  expect(result).toBeDefined();
});
```

#### Web Component Tests
```typescript
// components/feature/Component.test.tsx
import { render, screen } from "@testing-library/react";

describe("Component", () => {
  it("should render", () => {
    render(<Component />);
    expect(screen.getByText("Expected")).toBeInTheDocument();
  });
});
```

#### Mobile Component Tests
```typescript
// components/feature/Component.test.tsx
import { render } from "@testing-library/react-native";

describe("Component", () => {
  it("should render", () => {
    const { getByText } = render(<Component />);
    expect(getByText("Expected")).toBeTruthy();
  });
});
```

### Feature Parity Verification

```typescript
// Checklist for each feature
const verificationChecklist = {
  feature: "Property Search",
  web: {
    implemented: true,
    tested: true,
    matchesDesign: true,
  },
  mobile: {
    implemented: true,
    tested: true,
    matchesDesign: true,
  },
  backend: {
    schema: true,
    functions: true,
    tested: true,
  },
};
```

---

## PLAYBOOK 7: DOCUMENTATION

**Agent:** All Agents  
**Duration:** Ongoing  
**Priority:** MEDIUM

### Documentation Requirements

1. **AGENTS.md Updates**
   - New component patterns
   - New API endpoints
   - Architecture changes

2. **README.md Updates**
   - Setup instructions
   - New environment variables
   - Feature flags

3. **Inline Documentation**
   - JSDoc for complex functions
   - Component prop documentation
   - Hook usage examples

4. **Architecture Decision Records**
   - Major technical decisions
   - Migration rationale
   - Trade-off analysis

---

## SWARM COORDINATION

### Communication Protocol

1. **Daily Standups**
   - Progress updates
   - Blocker identification
   - Coordination needs

2. **Shared Resources**
   - Convex backend (shared)
   - Design tokens (shared)
   - Types (auto-generated)

3. **Conflict Resolution**
   - Schema changes: Backend Agent coordinates
   - UI changes: UI Agent coordinates
   - Feature dependencies: Document in tickets

### Ticket Structure

```markdown
## Feature: [Name]

### Scope
- [ ] Backend: Schema + Functions
- [ ] Web: Pages + Components
- [ ] Mobile: Screens + Components
- [ ] Testing: Unit + Integration
- [ ] Documentation

### Dependencies
- Depends on: #XXX
- Blocks: #YYY

### Acceptance Criteria
- [ ] Feature works on Web
- [ ] Feature works on Mobile
- [ ] Tests pass
- [ ] Documentation complete
```

---

*End of Implementation Playbooks*
