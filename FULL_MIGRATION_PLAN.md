# HAUS Platform - Full Migration Plan

**Generated:** 2026-02-02  
**Source:** `/Users/alias/Desktop/haus-voice-search` (Legacy Single-App Repo)  
**Target:** `/Users/alias/Desktop/haus-voice-search/_external/haus-turborepo-prod` (Turborepo Monorepo)  
**Objective:** Full feature parity across Web, Mobile, and Backend

---

## 📊 Executive Summary

### Source Repository Stats
| Metric | Count |
|--------|-------|
| **Page Routes** | 93 |
| **API Routes** | 31 |
| **Components** | 510 |
| **Hooks** | 19 |
| **Convex Functions** | 21 |
| **Lib Utilities** | 34 |
| **Database Tables** | 23 |

### Target Repository Stats
| Metric | Count |
|--------|-------|
| **Apps** | 5 (app, web, appraisal, mobile, studio) |
| **Packages** | 5 (backend, ui, analytics, email, logger) |
| **Database Tables** | 20+ |
| **Shared Components** | 25+ |

### Gap Analysis
- **Components Missing:** ~300+ components need migration/adaptation
- **Pages Missing:** ~60+ routes need creation
- **API Routes Missing:** ~25 endpoints need migration
- **Database Tables Missing:** 9 critical tables + schema alignment

---

## 🎯 Migration Philosophy

### Principles
1. **Incremental Migration** - Migrate feature-by-feature, not file-by-file
2. **Platform Consistency** - Same features across Web + Mobile where applicable
3. **Shared Backend** - Single Convex backend serves all platforms
4. **Design System Alignment** - Adapt components to use `@v1/ui` primitives
5. **Type Safety** - Maintain strict TypeScript throughout

---

## 🗺️ Migration Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Establish shared infrastructure

#### 1.1 Database Schema Alignment
```
packages/backend/convex/schema.ts
```

**Tables to Add:**
| Table | Priority | From Source | Notes |
|-------|----------|-------------|-------|
| `dudReports` | CRITICAL | `convex/schema.ts` | Trust/DUD database |
| `providers` | CRITICAL | `convex/schema.ts` | Marketplace providers |
| `compassListings` | HIGH | `convex/schema.ts` | Map search data |
| `marketCategories` | HIGH | `convex/schema.ts` | Provider categories |
| `tenders` | MEDIUM | `convex/schema.ts` | Document management |
| `tenderDocuments` | MEDIUM | `convex/schema.ts` | Tender docs |
| `userProgress` | MEDIUM | `convex/schema.ts` | Gamification |
| `achievements` | MEDIUM | `convex/schema.ts` | Achievements |
| `lessons` | MEDIUM | `convex/schema.ts` | Academy content |
| `knowledge` | LOW | `convex/schema.ts` | May use facts instead |
| `entities` | LOW | `convex/schema.ts` | May use Neo4j |

**Schema Modifications:**
- Align `conversations` table with source (if needed for backward compat)
- Add indexes for new query patterns
- Ensure `properties` backward compatibility

#### 1.2 Convex Functions Migration

**Functions to Create/Migrate:**
```
packages/backend/convex/
├── dudReports.ts          # NEW - Trust system
├── providers.ts           # NEW - Marketplace
├── marketCategories.ts    # NEW - Categories
├── compassListings.ts     # NEW - Map search
├── userProgress.ts        # NEW - Gamification
├── tenders.ts             # NEW - Document management
├── cortex_memory.ts       # ADAPT - Align with source
```

#### 1.3 Shared Types
```
packages/backend/convex/_generated/  # Regenerate after schema changes
```

---

### Phase 2: Core Property Features (Weeks 3-4)
**Goal:** Property search, listings, and details

#### 2.1 Property Search & Discovery

**Web (`apps/app`):**
```
app/[locale]/
├── search/
│   └── page.tsx                    # EXISTS - Enhance
├── compass/
│   └── page.tsx                    # NEW - Map search
├── explore/
│   └── page.tsx                    # NEW - Discovery
├── suburb/
│   └── [slug]/
│       └── page.tsx                # NEW - Suburb profiles
└── regions/
    └── page.tsx                    # NEW - Regional explorer
```

**Components to Migrate:**
| Source | Target | Adaptation |
|--------|--------|------------|
| `components/compass/*` | `apps/app/src/components/compass/` | Use `@v1/ui` primitives |
| `components/search/*` | `apps/app/src/components/search/` | Enhance existing |
| `components/property/*` | `apps/app/src/components/property/` | New folder |
| `components/explore/*` | `apps/app/src/components/explore/` | New folder |
| `components/featured-listings.tsx` | `apps/app/src/components/` | Enhance existing |

**Mobile (`apps/mobile`):**
```
app/(tabs)/
├── search.tsx                      # EXISTS - Enhance
└── explore.tsx                     # NEW - Discovery tab
```

**Components:**
- `components/search/SearchFiltersModal.tsx` - Add map filters
- `components/search/CompassMapView.tsx` - NEW

#### 2.2 Property Details

**Web:**
```
app/[locale]/
├── property/
│   └── [id]/
│       └── page.tsx                # EXISTS - Enhance
```

**Components:**
| Source | Target |
|--------|--------|
| `components/property/property-detail-content.tsx` | Enhance existing modal |
| `components/property/property-gallery.tsx` | Add to modal |
| `components/property/virtual-tour.tsx` | NEW |
| `components/property/similar-properties.tsx` | NEW |

#### 2.3 Saved Properties & Lists

**Web:**
```
app/[locale]/
├── saved/
│   └── page.tsx                    # NEW - Saved properties
└── list/
    ├── page.tsx                    # EXISTS - Enhance
    └── create/
        └── page.tsx                # NEW - Create listing
```

**Mobile:** Already exists in `(tabs)/favorites.tsx`

---

### Phase 3: AI & Voice Features (Weeks 5-6)
**Goal:** Complete voice AI parity

#### 3.1 Voice Copilot System

**Web Components:**
| Source | Target | Action |
|--------|--------|--------|
| `components/voice-copilot.tsx` | Review existing | Compare features |
| `components/voice-copilot-unified.tsx` | Review existing | Compare features |
| `components/voice-copilot-modal.tsx` | `apps/app/src/components/haus/` | Migrate enhancements |
| `components/voice/*` | `apps/app/src/components/voice/` | Migrate 14 files |
| `components/cedar/*` | `apps/app/src/components/cedar/` | Migrate Cedar voice |
| `components/ai-elements/*` | `apps/app/src/components/ai-elements/` | Migrate 19 AI components |
| `components/ara-*.tsx` | `apps/app/src/components/` | Migrate Ara system |

**Mobile:** Already has LiveKit integration
- Enhance with additional voice commands from source

#### 3.2 AI Chat & Copilot

**Web:**
```
app/[locale]/
├── copilot-demo/
│   └── page.tsx                    # NEW - Copilot demo
└── deephaus/
    └── page.tsx                    # NEW - Deep analysis
```

**Components:**
| Source | Target |
|--------|--------|
| `components/deephaus/deephaus-content.tsx` | `apps/app/src/components/deephaus/` |
| `components/copilot/*` | `apps/app/src/components/copilot/` |
| `components/ai-elements/*` | `apps/app/src/components/ai-elements/` |

#### 3.3 Voice Navigation

**Web:**
```
app/[locale]/
└── voice-nav-demo/
    └── page.tsx                    # NEW - Voice navigation demo
```

**Components:**
| Source | Target |
|--------|--------|
| `components/voice/voice-navigation-orb.tsx` | `apps/app/src/components/voice/` |
| `components/voice/voice-navigation-overlay.tsx` | `apps/app/src/components/voice/` |
| `hooks/use-voice-navigation.ts` | `apps/app/src/hooks/` |

---

### Phase 4: Marketplace (Weeks 7-8)
**Goal:** Service provider marketplace

**Web:**
```
app/[locale]/
└── market/
    ├── page.tsx                    # EXISTS - Enhance
    ├── [category]/
    │   └── page.tsx                # NEW - Category view
    ├── provider/
    │   └── [slug]/
    │       └── page.tsx            # NEW - Provider profile
    ├── join/
    │   └── page.tsx                # NEW - Provider onboarding
    └── dashboard/
        └── page.tsx                # NEW - Provider dashboard
```

**Mobile:**
```
app/(tabs)/
└── market.tsx                      # EXISTS - Enhance
```

**Components:**
| Source | Target |
|--------|--------|
| `components/market/*` | `apps/app/src/components/market/` |
| `components/market/category-content.tsx` | Migrate |
| `components/market/provider-profile-content.tsx` | Migrate |
| `components/market/provider-dashboard-content.tsx` | Migrate |
| `components/market/provider-join-content.tsx` | Migrate |
| `components/market/quote-request-content.tsx` | Migrate |

---

### Phase 5: Trust & Safety (Weeks 9-10)
**Goal:** DUD database and Watchdog system

**Web:**
```
app/[locale]/
├── trust/
│   ├── page.tsx                    # NEW - Trust center
│   └── dud/
│       └── [id]/
│           └── page.tsx            # NEW - DUD report
└── watchdog/
    ├── page.tsx                    # NEW - Watchdog home
    ├── interface/
    │   └── page.tsx                # NEW - Watchdog UI
    └── case-report/
        ├── page.tsx                # NEW - Case list
        └── [id]/
            └── page.tsx            # NEW - Case detail
```

**Components:**
| Source | Target |
|--------|--------|
| `components/trust/*` | `apps/app/src/components/trust/` |
| `components/watchdog/*` | `apps/app/src/components/watchdog/` |

---

### Phase 6: Academy & Education (Weeks 11-12)
**Goal:** Learning platform with gamification

**Web:**
```
app/[locale]/
└── academy/
    ├── page.tsx                    # NEW - Academy home
    ├── course/
    │   └── [id]/
    │       └── page.tsx            # NEW - Course detail
    ├── lesson/
    │   └── [courseId]/
    │       └── [lessonId]/
    │           └── page.tsx        # NEW - Lesson view
    ├── progress/
    │   └── page.tsx                # NEW - Progress tracking
    └── regions/
        └── page.tsx                # NEW - Regional guides
```

**Mobile:** Already exists - sync features

**Components:**
| Source | Target |
|--------|--------|
| `components/academy/*` | `apps/app/src/components/academy/` |
| `components/first-home/*` | `apps/app/src/components/first-home/` |

---

### Phase 7: User Features (Weeks 13-14)
**Goal:** Dashboard, messages, collaboration

**Web:**
```
app/[locale]/
├── dashboard/
│   └── page.tsx                    # NEW - User dashboard
├── messages/
│   └── page.tsx                    # NEW - Messaging
├── tasks/
│   └── page.tsx                    # NEW - Task management
├── rooms/
│   └── page.tsx                    # NEW - Collaborative rooms
├── vault/
│   └── page.tsx                    # NEW - Document vault
├── upload/
│   └── page.tsx                    # NEW - File upload
└── documents/
    └── page.tsx                    # NEW - Document manager
```

**Components:**
| Source | Target |
|--------|--------|
| `components/dashboard/*` | `apps/app/src/components/dashboard/` |
| `components/messages/*` | `apps/app/src/components/messages/` |
| `components/rooms/*` | `apps/app/src/components/rooms/` |
| `components/vault/*` | `apps/app/src/components/vault/` |
| `components/upload/*` | `apps/app/src/components/upload/` |
| `components/documents/*` | `apps/app/src/components/documents/` |

---

### Phase 8: Agent Tools (Weeks 15-16)
**Goal:** Real estate agent features

**Web:**
```
app/[locale]/
├── agent/
│   ├── dashboard/
│   │   └── page.tsx                # NEW - Agent dashboard
│   └── pipeline/
│       └── page.tsx                # NEW - Sales pipeline
└── agency/
    └── page.tsx                    # NEW - Agency portal
```

**Components:**
| Source | Target |
|--------|--------|
| `components/agency/*` | `apps/app/src/components/agency/` |

---

### Phase 9: Tools & Calculators (Weeks 17-18)
**Goal:** Utility features

**Web:**
```
app/[locale]/
├── tools/
│   ├── mortgage-calculator/
│   │   └── page.tsx                # NEW - Mortgage calc
│   └── compare/
│       └── page.tsx                # NEW - Property compare
├── affordability/
│   └── page.tsx                    # NEW - Affordability
├── preapproval/
│   └── page.tsx                    # NEW - Pre-approval
└── appraisal/
    └── page.tsx                    # EXISTS - Review
```

**Mobile:** Already has affordability in academy

---

### Phase 10: Marketing & Content (Weeks 19-20)
**Goal:** Marketing site enhancement

**Web (`apps/web`):**
```
app/
├── about/
│   ├── page.tsx                    # NEW - About
│   ├── careers/
│   │   └── page.tsx                # NEW - Careers
│   └── press/
│       └── page.tsx                # NEW - Press
├── contact/
│   └── page.tsx                    # NEW - Contact
├── legal/
│   ├── privacy/
│   │   └── page.tsx                # NEW - Privacy
│   ├── terms/
│   │   └── page.tsx                # NEW - Terms
│   └── austrac/
│       └── page.tsx                # NEW - AUSTRAC
└── experience/
    └── page.tsx                    # NEW - Digital experience
```

---

## 📦 Component Migration Matrix

### Critical Components (Migrate First)

| Component | Source Path | Target Path | Priority | Platform |
|-----------|-------------|-------------|----------|----------|
| Advanced Search Filters | `components/advanced-search-filters.tsx` | `apps/app/src/components/` | CRITICAL | Web |
| Property Card | `components/property-card.tsx` | Review existing | HIGH | Both |
| Property Results | `components/property-results.tsx` | Review existing | HIGH | Both |
| Voice Copilot Modal | `components/voice-copilot-modal.tsx` | Enhance existing | CRITICAL | Both |
| Compass Content | `components/compass/*` | New folder | HIGH | Web |
| Market Content | `components/market/*` | Enhance existing | HIGH | Web |
| DUD Content | `components/trust/*` | New folder | MEDIUM | Web |
| Academy Content | `components/academy/*` | New folder | MEDIUM | Both |
| Dashboard Content | `components/dashboard/*` | New folder | MEDIUM | Web |
| Voice Navigation | `components/voice/voice-navigation-*.tsx` | New folder | MEDIUM | Web |
| Cedar Voice | `components/cedar/*` | New folder | LOW | Web |
| AI Elements | `components/ai-elements/*` | New folder | MEDIUM | Both |

---

## 🔌 API Routes Migration

### Routes to Migrate

| Source Route | Target Location | Purpose |
|--------------|-----------------|---------|
| `/api/agent` | `apps/app/src/app/api/agent/route.ts` | Claude buyers agent |
| `/api/pica-voice-search` | `apps/app/src/app/api/pica-voice-search/route.ts` | Pica integration |
| `/api/cedar-voice` | `apps/app/src/app/api/cedar-voice/route.ts` | Cedar voice |
| `/api/copilot` | `apps/app/src/app/api/copilot/route.ts` | Copilot endpoint |
| `/api/listing-ai` | `apps/app/src/app/api/listing-ai/route.ts` | Listing AI |
| `/api/style-recognition` | `apps/app/src/app/api/style-recognition/route.ts` | Image AI |
| `/api/seed-compass` | `apps/app/src/app/api/seed-compass/route.ts` | Compass data |
| `/api/market/providers` | `apps/app/src/app/api/market/providers/route.ts` | Provider API |
| `/api/reports/dud` | `apps/app/src/app/api/reports/dud/route.ts` | DUD reports |
| `/api/suburb/[slug]` | `apps/app/src/app/api/suburb/[slug]/route.ts` | Suburb data |
| `/api/x-search` | `apps/app/src/app/api/x-search/route.ts` | X search |
| `/api/x-sentiment` | `apps/app/src/app/api/x-sentiment/route.ts` | X sentiment |
| `/api/tweets` | `apps/app/src/app/api/tweets/route.ts` | Tweet fetch |

---

## 🎣 Hooks Migration

| Hook | Source | Target | Platform |
|------|--------|--------|----------|
| use-voice-navigation.ts | `hooks/use-voice-navigation.ts` | `apps/app/src/hooks/` | Web |
| use-voice-navigation-enhanced.ts | `hooks/use-voice-navigation-enhanced.ts` | `apps/app/src/hooks/` | Web |
| use-scribe-realtime.ts | `hooks/use-scribe-realtime.ts` | `apps/app/src/hooks/` | Both |
| use-copilot-property-tools.ts | `hooks/use-copilot-property-tools.ts` | `apps/app/src/hooks/` | Both |
| use-elevenlabs-tts.ts | `hooks/use-elevenlabs-tts.ts` | Review existing | Both |
| use-livekit-agent.ts | `hooks/use-livekit-agent.ts` | `apps/mobile/hooks/` exists | Both |
| use-openai-voice-chat.ts | `hooks/use-openai-voice-chat.ts` | Review existing | Both |
| use-gsap-reveal.ts | `hooks/use-gsap-reveal.ts` | `apps/app/src/hooks/` | Web |
| use-in-view-animation.ts | `hooks/use-in-view-animation.ts` | `apps/app/src/hooks/` | Web |
| use-lenis.ts | `hooks/use-lenis.ts` | `apps/app/src/hooks/` | Web |
| use-preloader.ts | `hooks/use-preloader.ts` | `apps/app/src/hooks/` | Web |

---

## 🔧 Utilities Migration

| Utility | Source | Target | Notes |
|---------|--------|--------|-------|
| AI Config | `lib/ai.ts` | `packages/backend/convex/ai/` | Review existing |
| Validation | `lib/validation.ts` | Review existing | Compare schemas |
| Rate Limit | `lib/rate-limit.ts` | Review existing | May be duplicate |
| Buyers Agent | `lib/agents/buyers-agent/*` | `packages/backend/convex/ai/` | Migrate tools |
| Pica Integration | `lib/pica-integration.ts` | `packages/backend/lib/` | NEW |
| Scribe Realtime | `lib/scribe-realtime.ts` | `packages/backend/lib/` | NEW |
| Design Tokens | `lib/design-tokens.ts` | `packages/ui/src/` | Extract to shared |

---

## 🎨 Design System Migration

### UI Components (`components/ui/` → `@v1/ui`)

The source repo has 34 shadcn/ui components. The target has 25. **Action:** Audit and sync.

| Component | Source | Target | Action |
|-----------|--------|--------|--------|
| Button | ✅ | ✅ | Review variants |
| Card | ✅ | ✅ | Review variants |
| Dialog | ✅ | ✅ | Compare |
| Sheet | ✅ | ✅ | Compare |
| Command | ✅ | ❌ | MIGRATE |
| Carousel | ✅ | ❌ | MIGRATE |
| Sidebar | ✅ | ✅ | Compare |
| Map | ✅ | ❌ | MIGRATE |

### Skiper UI Components

The source has 59 animated components in `components/skiper-ui/`. These should be migrated to:
- `apps/app/src/components/skiper-ui/` for web-specific
- Adapt select components for mobile

---

## 📱 Mobile-Specific Considerations

### Features to Add to Mobile

| Feature | Status | Notes |
|---------|--------|-------|
| Compass Map Search | ❌ MISSING | Add map-based search |
| DUD Reports | ❌ MISSING | Add trust scores |
| Voice Navigation | ❌ MISSING | Add command system |
| DeepHaus AI | ❌ MISSING | Add property analysis |
| Marketplace Quotes | ❌ MISSING | Add quote requests |
| Rooms/Collaboration | ❌ MISSING | Add shared browsing |
| Document Vault | ✅ EXISTS | Already implemented |
| Academy | ✅ EXISTS | Already implemented |

### Mobile Components Needed

```
apps/mobile/components/
├── compass/
│   ├── CompassMapView.tsx
│   └── CompassFilterModal.tsx
├── trust/
│   ├── DUDScoreCard.tsx
│   └── TrustBadge.tsx
├── voice/
│   ├── VoiceCommandModal.tsx
│   └── VoiceNavigationHelp.tsx
└── deephaus/
    └── PropertyAnalysisView.tsx
```

---

## 🗄️ Data Migration Strategy

### Phase 1: Schema Migration
1. Add missing tables to target schema
2. Run `convex dev` to apply changes
3. Generate new types: `convex dev --typecheck`

### Phase 2: Data Export/Import
```bash
# From source repo
npx convex export --path ./export

# To target repo  
npx convex import --path ./export
```

### Phase 3: Data Transformation
- Transform old `conversations` format to new Cortex format
- Migrate `properties` to `propertyListings`
- Convert `knowledge` to `facts` if applicable

---

## ⚠️ Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Database incompatibility | HIGH | Schema migration plan, backup data |
| Component dependency hell | MEDIUM | Migrate bottom-up (primitives first) |
| Auth system differences | HIGH | Test auth flows thoroughly |
| Mobile/Web feature parity | MEDIUM | Maintain feature checklist |
| Performance regression | MEDIUM | Benchmark before/after |
| Type errors | LOW | Strict TypeScript, gradual migration |

---

## 📋 Implementation Checklist

### Pre-Migration
- [ ] Complete database schema alignment
- [ ] Set up feature flags for gradual rollout
- [ ] Create component inventory spreadsheet
- [ ] Establish testing baseline

### Per-Phase
- [ ] Migrate database schema
- [ ] Migrate Convex functions
- [ ] Migrate API routes
- [ ] Migrate components
- [ ] Migrate hooks
- [ ] Update types
- [ ] Test on web
- [ ] Test on mobile
- [ ] Update documentation

### Post-Migration
- [ ] Archive source repo
- [ ] Update CI/CD pipelines
- [ ] Train team on new structure
- [ ] Monitor error rates

---

## 📚 Documentation to Update

| Document | Location | Action |
|----------|----------|--------|
| AGENTS.md | Root | Update with new structure |
| README.md | Root | Update setup instructions |
| API Documentation | `docs/` | Migrate from source |
| Component Docs | Storybook | Update stories |

---

## 🎯 Success Metrics

| Metric | Target |
|--------|--------|
| Feature Parity | 100% of source features in target |
| Code Coverage | >80% test coverage |
| Build Time | <5 minutes for all apps |
| Bundle Size | <500KB initial load |
| Mobile/Web Sync | Same-day feature releases |

---

## 📅 Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Foundation | 2 weeks | 2 weeks |
| Core Property | 2 weeks | 4 weeks |
| AI & Voice | 2 weeks | 6 weeks |
| Marketplace | 2 weeks | 8 weeks |
| Trust & Safety | 2 weeks | 10 weeks |
| Academy | 2 weeks | 12 weeks |
| User Features | 2 weeks | 14 weeks |
| Agent Tools | 2 weeks | 16 weeks |
| Tools | 2 weeks | 18 weeks |
| Marketing | 2 weeks | 20 weeks |
| **TOTAL** | **20 weeks** | **~5 months** |

---

**End of Migration Plan**

*This document should be updated as migration progresses.*
