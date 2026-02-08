# Migration Analysis: haus-platform-1 → haus-turborepo-prod

**Generated:** 2026-02-04
**Source:** `/Users/alias/haus-platform-1`
**Target:** `/Users/alias/Desktop/haus-voice-search/_external/haus-turborepo-prod`

---

## Executive Summary

The source project (`haus-platform-1`) is a standalone Expo 55 mobile app with tRPC/Hono backend and AI SDK 6 integration. The target (`haus-turborepo-prod`) is a Turborepo monorepo with Next.js web apps, Expo mobile app, and Convex backend with Cortex memory integration.

**Key Finding:** The target project already has MORE comprehensive infrastructure (Cortex memory, LiveKit voice, advanced schema). Migration should focus on **UI components, design tokens, skills, and test flows** — not backend logic.

---

## Version Comparison

| Component | Source (haus-platform-1) | Target (haus-turborepo-prod) |
|-----------|--------------------------|------------------------------|
| Expo | 55.0.0-preview.8 | 54.0.32 (stable) |
| React Native | 0.83.1 | 0.79.0 |
| Expo Router | 55.0.0-preview.5 | 4.0.22 |
| React | 19.2.0 | 19.1.0 |
| Convex | 1.31.7 | 1.31.7 ✓ |
| AI SDK | 6.0.62 | 6.0.67 ✓ (newer) |
| Backend | tRPC + Hono | Convex (full) |

**Note:** Source uses Expo 55 preview which has breaking changes. Target uses stable Expo 54.

---

## Migration Categories

### ✅ ALREADY IN TARGET (Skip Migration)

| Component | Target Location | Status |
|-----------|-----------------|--------|
| Convex Schema | `packages/backend/convex/schema.ts` | **Superior** - Has Cortex memory layer |
| Property Components | `apps/mobile/components/property/` | Exists |
| Search Components | `apps/mobile/components/search/` | Exists |
| Academy Components | `apps/mobile/components/academy/` | Exists with 6 components |
| AI Chat Components | `apps/mobile/components/ai/` | Exists with PropertyChat |
| Vault/Upload | `apps/mobile/components/vault/` | Exists |
| Voice Features | `apps/mobile/components/voice/` | **Superior** - LiveKit integration |
| Cortex Memory | `packages/backend/convex/cortex.ts` | **Superior** - Full memory system |

### 🔄 WORTH MIGRATING (Priority Order)

#### 1. Design Tokens System (HIGH PRIORITY)

**Source:** `constants/designTokens.ts`
**Target:** Create at `apps/mobile/constants/designTokens.ts`

Complete design token system including:
- Color palette (sky, blue, cyan, amber, rose, emerald, neutral)
- Typography (Abel font, sizes, weights)
- Spacing scale (xs → xxxl)
- Border radius scale
- Shadow definitions
- Component presets (card, button, iconWrapper, pill, input)
- Category colors (learn, plan, explore, prepare, apply, collaborate)
- Gradients

**Migration Command:**
```bash
cp /Users/alias/haus-platform-1/constants/designTokens.ts \
   apps/mobile/constants/designTokens.ts
```

#### 2. AI Elements Components (HIGH PRIORITY)

**Source:** `components/ai-elements/`
**Target:** Create at `apps/mobile/components/ai-elements/`

| Component | Purpose | Lines |
|-----------|---------|-------|
| Conversation.tsx | AI conversation container | ~150 |
| Message.tsx | Individual message bubble | ~100 |
| Reasoning.tsx | Chain-of-thought display | ~80 |
| Shimmer.tsx | Loading shimmer effect | ~50 |
| Tool.tsx | Tool call visualization | ~100 |
| Loader.tsx | AI loading indicator | ~40 |
| index.ts | Barrel export | ~10 |

**Migration Command:**
```bash
cp -r /Users/alias/haus-platform-1/components/ai-elements \
      apps/mobile/components/ai-elements
```

#### 3. Dashboard Components (MEDIUM PRIORITY)

**Source:** `components/dashboard/`
**Target:** Create at `apps/mobile/components/dashboard/`

| Component | Purpose |
|-----------|---------|
| ChartWidget.tsx | Chart visualization widget |
| MetricWidget.tsx | KPI/metric display |
| RealTimeWidget.tsx | Real-time data widget |
| TableWidget.tsx | Data table widget |
| DashboardLayout.tsx | Dashboard layout container |
| BottomNavigation.tsx | Bottom nav component |

#### 4. Utility Components (MEDIUM PRIORITY)

| Source Component | Target Location | Purpose |
|-----------------|-----------------|---------|
| EmptyState.tsx | `components/ui/` | Empty state placeholder |
| ErrorBoundary.tsx | `components/` | Error boundary wrapper |
| FilterButton.tsx | `components/search/` | Filter action button |
| SplashScreen.tsx | `components/` | App splash screen |
| PropertySkeleton.tsx | `components/property/` | Loading skeleton |

#### 5. Custom Hooks (MEDIUM PRIORITY)

**Source:** `hooks/`
**Target:** Merge into `apps/mobile/hooks/`

| Hook | Purpose | Notes |
|------|---------|-------|
| useFavorites.ts | Favorites with AsyncStorage | Different from web implementation |
| useProperties.ts | Property queries | Review before merging |
| usePropertyChat.ts | Property-context chat | May conflict with existing |

#### 6. Providers (LOW PRIORITY)

| Source | Purpose | Target Notes |
|--------|---------|--------------|
| RealtimeFiltersProvider.tsx | Shared filter state | May already exist differently |
| ThemeProvider.tsx | Light/dark theme | Target uses NativeWind |

#### 7. Claude/Agent Skills (HIGH PRIORITY)

**Source:** `.claude/skills/` and `skills/`
**Target:** Copy to project or user skills directory

| Skill Directory | Purpose |
|-----------------|---------|
| `haus-ai-sdk-patterns/` | AI SDK integration patterns |
| `haus-convex-patterns/` | Convex schema/query patterns |
| `haus-expo-patterns/` | Expo navigation/UI patterns |
| `haus-gemini-analysis/` | Property image analysis |
| `haus-react-query-patterns/` | React Query usage |
| `haus-trpc-patterns/` | tRPC route patterns |
| `first-home-buyer-act/` | ACT first home buyer info |
| `first-home-buyer-nsw/` | NSW first home buyer info |
| `first-home-buyer-nt/` | NT first home buyer info |
| `first-home-buyer-qld/` | QLD first home buyer info |
| `first-home-buyer-sa/` | SA first home buyer info |
| `first-home-buyer-tas/` | TAS first home buyer info |
| `first-home-buyer-vic/` | VIC first home buyer info |
| `first-home-buyer-wa/` | WA first home buyer info |
| `haus-voice-agent/` | Voice agent patterns |

**Migration Command:**
```bash
# Project skills
cp -r /Users/alias/haus-platform-1/.claude/skills/* \
      apps/mobile/.claude/skills/

# State-specific skills (useful for academy)
cp -r /Users/alias/haus-platform-1/skills/* \
      apps/mobile/skills/
```

#### 8. Maestro Test Flows (HIGH PRIORITY)

**Source:** `.maestro/`
**Target:** Create at `apps/mobile/.maestro/`

| Flow | Purpose |
|------|---------|
| config.yaml | Maestro configuration |
| academy-flow.yaml | Academy feature tests |
| home-screen-flow.yaml | Home screen tests |
| landing-page-flow.yaml | Landing page tests |
| quick-access-flow.yaml | Quick access tests |

**Migration Command:**
```bash
cp -r /Users/alias/haus-platform-1/.maestro \
      apps/mobile/.maestro
```

---

## Screen Comparison

### Screens in Source NOT in Target

These screens exist in source but need review for target:

| Screen | Source Path | Notes |
|--------|-------------|-------|
| Upload | `app/(tabs)/(haus)/upload.tsx` | Document upload with AI |
| State Selector | `app/(tabs)/(haus)/state-selector.tsx` | State selection |
| State Guide | `app/(tabs)/(haus)/state/[id].tsx` | State-specific guides |
| Request Intro | `app/(tabs)/(haus)/request-intro.tsx` | Agent intro request |
| Review Submit | `app/(tabs)/(haus)/review-submit.tsx` | Review submission |
| Progress | `app/(tabs)/(haus)/progress.tsx` | User progress view |
| Paths | `app/(tabs)/(haus)/path/[id].tsx` | Learning paths |
| Courses | `app/(tabs)/(haus)/courses.tsx` | Course listing |
| Course Detail | `app/(tabs)/(haus)/course/[id].tsx` | Course details |
| Lesson | `app/(tabs)/(haus)/lesson/[courseId]/[lessonId].tsx` | Lesson content |
| Dashboard | `app/(tabs)/(profile)/dashboard.tsx` | Profile dashboard |
| Exclusive | `app/(tabs)/(profile)/exclusive.tsx` | Exclusive content |

---

## Migration Scripts

### Quick Migration (Design + AI Elements + Skills)

```bash
#!/bin/bash
cd /Users/alias/Desktop/haus-voice-search/_external/haus-turborepo-prod

# 1. Design Tokens
mkdir -p apps/mobile/constants
cp /Users/alias/haus-platform-1/constants/designTokens.ts apps/mobile/constants/

# 2. AI Elements
cp -r /Users/alias/haus-platform-1/components/ai-elements apps/mobile/components/

# 3. Dashboard Components
cp -r /Users/alias/haus-platform-1/components/dashboard apps/mobile/components/

# 4. Utility Components
cp /Users/alias/haus-platform-1/components/EmptyState.tsx apps/mobile/components/ui/
cp /Users/alias/haus-platform-1/components/ErrorBoundary.tsx apps/mobile/components/
cp /Users/alias/haus-platform-1/components/SplashScreen.tsx apps/mobile/components/
cp /Users/alias/haus-platform-1/components/PropertySkeleton.tsx apps/mobile/components/property/

# 5. Maestro Tests
cp -r /Users/alias/haus-platform-1/.maestro apps/mobile/

# 6. Skills
mkdir -p apps/mobile/.claude/skills
cp -r /Users/alias/haus-platform-1/.claude/skills/* apps/mobile/.claude/skills/
mkdir -p apps/mobile/skills
cp -r /Users/alias/haus-platform-1/skills/* apps/mobile/skills/

echo "Migration complete!"
```

### Post-Migration Fixes

After copying, these files will need updates:

1. **Import paths**: Change `@/` to correct monorepo paths
2. **Design tokens**: May need to align with NativeWind tokens
3. **Component dependencies**: Update for Expo 54 vs 55 differences
4. **Hooks**: Review for conflicts with existing implementations

---

## NOT Recommended for Migration

| Component | Reason |
|-----------|--------|
| Convex schema | Target schema is more comprehensive (Cortex) |
| tRPC/Hono backend | Target uses Convex functions (better integration) |
| AI SDK routes | Target has Convex actions (no separate backend) |
| Voice features | Target has LiveKit (more advanced) |
| Root _layout.tsx | Provider hierarchy differs |
| lib/trpc.ts | Not using tRPC in target |
| lib/convex.ts | Target has different setup |

---

## Mock Data to Reference

**Source:** `mocks/properties.ts`, `mocks/academy.ts`

These contain comprehensive mock data that can be useful for:
- Seeding development database
- Writing tests
- Understanding expected data shapes

---

## Documentation to Preserve

| Document | Purpose |
|----------|---------|
| AGENTS.md | Project knowledge base |
| PROJECT_CONTEXT.md | Full project context |
| S-Tier-Blueprint.md | Architecture blueprint |
| PRODUCTION_READY_TASKLIST.md | Task list |
| docs/HAUS-NATIVE-APP-SPECIFICATION.md | App specification |

---

## Recommended Migration Order

1. **Design Tokens** → Enables consistent styling
2. **AI Elements** → Enhances AI chat UI
3. **Skills** → Improves agent assistance
4. **Maestro Tests** → Enables automated testing
5. **Dashboard Components** → Adds analytics UI
6. **Utility Components** → Fills UI gaps
7. **Hooks** (selective) → Review case by case

---

## Summary

| Category | Count | Action |
|----------|-------|--------|
| Already in Target | 7 groups | Skip |
| Worth Migrating | 8 groups | Copy + adapt |
| Not Recommended | 7 items | Skip |

**Estimated Migration Time:** 2-3 hours (with fixes)
**Risk Level:** Low (mostly additive)
