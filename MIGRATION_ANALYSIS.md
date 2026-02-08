# HAUS Migration - Detailed Feature Analysis

**Date:** 2026-02-02  
**Analyst:** Swarm Intelligence  
**Scope:** Complete feature inventory and gap analysis

---

## 1. FEATURE INVENTORY BY CATEGORY

### 1.1 Voice & AI Features

#### Source Repo (93 voice/AI related files)

| Feature | Component/Route | Status in Target | Migration Priority |
|---------|-----------------|------------------|-------------------|
| **ElevenLabs Voice System** | `components/voice/elevenlabs-voice-system.tsx` | Partial | CRITICAL |
| **Voice Copilot Modal** | `components/voice-copilot-modal.tsx` (26KB) | Exists (38KB) | Review differences |
| **Voice Copilot Unified** | `components/voice-copilot-unified.tsx` | Exists | Review differences |
| **Voice Orb** | `components/voice-orb.tsx` | Exists | Review differences |
| **Cedar Voice** | `components/cedar/*` (8 files) | MISSING | HIGH |
| **Ara Voice** | `components/ara-*.tsx` (3 files) | MISSING | MEDIUM |
| **LiveKit Agent UI** | `components/agents-ui/*` (10 files) | Partial | HIGH |
| **AI Elements** | `components/ai-elements/*` (19 files) | MISSING | HIGH |
| **Voice Navigation** | `components/voice/voice-navigation-*.tsx` (3 files) | MISSING | MEDIUM |
| **Voice Commands Help** | `components/voice/voice-commands-help.tsx` | MISSING | LOW |
| **Scribe Realtime** | `components/haus-scribe-interface.tsx` | MISSING | MEDIUM |
| **AI Voice Interface** | `components/ai-voice-interface.tsx` | Exists | Compare |
| **Enhanced Copilot** | `components/enhanced-voice-copilot.tsx` | MISSING | MEDIUM |
| **Floating AI Nav** | `components/floating-ai-nav.tsx` | MISSING | LOW |
| **Copilot Sidebar** | `components/copilot-sidebar.tsx` | MISSING | MEDIUM |
| **Voice Demo Pages** | `app/voice-demo*/page.tsx` (3 pages) | MISSING | LOW |
| **Copilot Demo** | `app/copilot-demo/page.tsx` | MISSING | LOW |
| **Voice Test** | `app/voice-test/page.tsx` | MISSING | LOW |

**AI API Endpoints:**
| Endpoint | Purpose | Status |
|----------|---------|--------|
| `/api/agent` | Claude buyers agent | MISSING |
| `/api/voice-search` | Gemini voice search | EXISTS |
| `/api/pica-voice-search` | Pica AI integration | MISSING |
| `/api/cedar-voice` | Cedar voice system | MISSING |
| `/api/copilot` | Copilot endpoint | MISSING |
| `/api/ai` | General AI endpoint | MISSING |
| `/api/elevenlabs/*` | ElevenLabs integration | Partial |

---

### 1.2 Property Search & Discovery

#### Source Repo Features

| Feature | Location | Status in Target | Priority |
|---------|----------|------------------|----------|
| **Advanced Search Filters** | `components/advanced-search-filters.tsx` (13KB) | Exists (12KB) | Review |
| **Compass Map Search** | `components/compass/*` (13 files) | MISSING | CRITICAL |
| **Property Results** | `components/property-results.tsx` | Exists (8KB) | Review |
| **Property Card** | `components/property-card.tsx` | Exists (6KB) | Review |
| **Property Detail Modal** | `components/property-detail-modal.tsx` (24KB) | Exists (24KB) | Review |
| **Featured Listings** | `components/featured-listings.tsx` | Exists | Review |
| **Suburb Profiles** | `app/suburb/[slug]/page.tsx` | MISSING | HIGH |
| **Regions Explorer** | `app/regions/page.tsx` | MISSING | MEDIUM |
| **Property Intelligence** | `app/property-intelligence/page.tsx` | MISSING | MEDIUM |
| **DeepHaus Analysis** | `app/deephaus/page.tsx` + `components/deephaus/*` | MISSING | MEDIUM |
| **Explore Page** | `app/explore/page.tsx` | MISSING | MEDIUM |
| **Off-Market Listings** | `app/offmarket/page.tsx` | MISSING | LOW |
| **Find Properties** | `app/find/page.tsx` | MISSING | LOW |
| **Property Comparison** | `app/tools/compare/page.tsx` | MISSING | LOW |

**Database Tables:**
| Table | Source | Target | Action |
|-------|--------|--------|--------|
| `properties` | ✅ | ✅ (legacy) | Migrate to `propertyListings` |
| `compassListings` | ✅ | ❌ | CREATE |
| `propertyMemories` | ❌ | ✅ | Use target version |
| `suburbPreferences` | ❌ | ✅ | Use target version |

---

### 1.3 Marketplace Features

#### Source Repo (14 components + API)

| Feature | Location | Status in Target | Priority |
|---------|----------|------------------|----------|
| **Market Home** | `app/market/page.tsx` | Exists | Review |
| **Marketplace Content** | `components/market/marketplace-content.tsx` (33KB) | Exists (34KB) | Review |
| **Category View** | `app/market/[category]/page.tsx` | MISSING | HIGH |
| **Provider Profile** | `app/market/provider/[slug]/page.tsx` | MISSING | HIGH |
| **Provider Dashboard** | `app/market/dashboard/page.tsx` | MISSING | HIGH |
| **Provider Join** | `app/market/join/page.tsx` | MISSING | MEDIUM |
| **Quote Request** | `app/market/quote/page.tsx` | MISSING | MEDIUM |

**Database Tables:**
| Table | Source | Target | Action |
|-------|--------|--------|--------|
| `providers` | ✅ | ❌ | CREATE |
| `marketCategories` | ✅ | ❌ | CREATE |

---

### 1.4 Trust & Safety (DUD/Watchdog)

#### Source Repo (35+ files)

| Feature | Location | Status in Target | Priority |
|---------|----------|------------------|----------|
| **Trust Center** | `app/trust/page.tsx` | MISSING | MEDIUM |
| **DUD Reports** | `app/trust/dud/[id]/page.tsx` | MISSING | MEDIUM |
| **DUD Content** | `components/trust/dud-content*.tsx` (4 files) | MISSING | MEDIUM |
| **Watchdog Home** | `app/watchdog/page.tsx` | MISSING | MEDIUM |
| **Watchdog Interface** | `app/watchdog/interface/page.tsx` | MISSING | MEDIUM |
| **Case Reports** | `app/watchdog/case-report/*.tsx` | MISSING | MEDIUM |
| **Watchdog Components** | `components/watchdog/*` (28 files) | MISSING | MEDIUM |

**Database Tables:**
| Table | Source | Target | Action |
|-------|--------|--------|--------|
| `dudReports` | ✅ | ❌ | CREATE |

---

### 1.5 Academy & Education

#### Source Repo (10+ files)

| Feature | Location | Status in Target | Priority |
|---------|----------|------------------|----------|
| **Academy Home** | `app/academy/page.tsx` | MISSING | MEDIUM |
| **Course Detail** | `app/academy/course/[id]/page.tsx` | MISSING | MEDIUM |
| **Lesson View** | `app/academy/lesson/[courseId]/[lessonId]/page.tsx` | MISSING | MEDIUM |
| **Progress Tracking** | `app/academy/progress/page.tsx` | MISSING | MEDIUM |
| **Regional Guides** | `app/academy/regions/page.tsx` | MISSING | LOW |
| **Academy Components** | `components/academy/*` (4 files) | MISSING | MEDIUM |
| **First Home Dashboard** | `components/first-home/*` (6 files) | MISSING | MEDIUM |
| **First Home Page** | `app/first-home/page.tsx` | MISSING | MEDIUM |

**Mobile Status:** ✅ Already implemented in `apps/mobile/app/(tabs)/(haus)/`

**Database Tables:**
| Table | Source | Target | Action |
|-------|--------|--------|--------|
| `userProgress` | ✅ | ❌ | CREATE |
| `achievements` | ✅ | ❌ | CREATE |
| `lessons` | ✅ | ❌ | CREATE |

---

### 1.6 User Dashboard & Collaboration

#### Source Repo (70+ files)

| Feature | Location | Status in Target | Priority |
|---------|----------|------------------|----------|
| **User Dashboard** | `app/dashboard/page.tsx` | MISSING | MEDIUM |
| **Dashboard Components** | `components/dashboard/*` (10 files) | MISSING | MEDIUM |
| **Messages/Inbox** | `app/messages/page.tsx` | MISSING | MEDIUM |
| **Messages Components** | `components/messages/*` | MISSING | MEDIUM |
| **Tasks** | `app/tasks/page.tsx` | MISSING | LOW |
| **Progress** | `app/progress/page.tsx` | MISSING | LOW |
| **Collaborative Rooms** | `app/rooms/page.tsx` | MISSING | MEDIUM |
| **Rooms Components** | `components/rooms/*` | MISSING | MEDIUM |
| **Deal Team** | `app/deal-team/page.tsx` | MISSING | LOW |
| **Deal Team Components** | `components/deal-team/*` | MISSING | LOW |
| **Team Page** | `app/team/page.tsx` | MISSING | LOW |

**Database Tables:**
| Table | Source | Target | Action |
|-------|--------|--------|--------|
| `rooms` | ✅ | ❌ (replaced) | Migrate to `collaborativeRooms` |
| `roomPresence` | ✅ | ✅ | Align schema |
| `userPreferences` | ✅ | ✅ | Align schema |

---

### 1.7 Document Management

#### Source Repo

| Feature | Location | Status in Target | Priority |
|---------|----------|------------------|----------|
| **Document Vault** | `app/vault/page.tsx` + `app/documents/vault/page.tsx` | MISSING | MEDIUM |
| **Documents Manager** | `app/documents/page.tsx` | MISSING | MEDIUM |
| **Upload Page** | `app/upload/page.tsx` | MISSING | MEDIUM |
| **Vault Components** | `components/vault/*` | MISSING | MEDIUM |
| **Upload Components** | `components/upload/*` | MISSING | MEDIUM |
| **Documents Components** | `components/documents/*` | MISSING | MEDIUM |

**Mobile Status:** ✅ Already implemented in `apps/mobile/components/vault/`

**Database Tables:**
| Table | Source | Target | Action |
|-------|--------|--------|--------|
| `uploads` | ✅ | ❌ (replaced) | Migrate to `propertyUploads` |
| `tenders` | ✅ | ❌ | CREATE |
| `tenderDocuments` | ✅ | ❌ | CREATE |

---

### 1.8 Agent & Agency Tools

#### Source Repo

| Feature | Location | Status in Target | Priority |
|---------|----------|------------------|----------|
| **Agent Dashboard** | `app/agent/dashboard/page.tsx` | MISSING | MEDIUM |
| **Sales Pipeline** | `app/agent/pipeline/page.tsx` | MISSING | MEDIUM |
| **Agency Portal** | `app/agency/page.tsx` | MISSING | MEDIUM |
| **Agency Components** | `components/agency/*` | MISSING | MEDIUM |
| **List Property** | `app/sell/page.tsx` | MISSING | LOW |
| **List Creation** | `app/list/create/page.tsx` | MISSING | LOW |
| **Listing Page** | `app/listing/page.tsx` | MISSING | LOW |
| **Listing Components** | `components/listing/*` (19 files) | MISSING | MEDIUM |
| **Listing Enhanced** | `components/listing-enhanced/*` | MISSING | LOW |

---

### 1.9 Tools & Calculators

#### Source Repo

| Feature | Location | Status in Target | Priority |
|---------|----------|------------------|----------|
| **Mortgage Calculator** | `app/tools/mortgage-calculator/page.tsx` | MISSING | MEDIUM |
| **Affordability** | `app/affordability/page.tsx` | MISSING | MEDIUM |
| **Pre-approval** | `app/preapproval/page.tsx` | MISSING | MEDIUM |
| **Appraisal** | `app/appraisal/page.tsx` | EXISTS (separate app) | Review integration |
| **Appraisal Components** | `components/appraisal/*` (32 files) | EXISTS | Already in separate app |

**Mobile Status:** ✅ Affordability exists in mobile academy

---

### 1.10 Marketing Pages

#### Source Repo (15+ pages)

| Feature | Location | Status in Target | Priority |
|---------|----------|------------------|----------|
| **Landing Page** | `app/(marketing)/page.tsx` | Exists in `apps/web` | Review |
| **About Page** | `app/about/page.tsx` | MISSING | LOW |
| **Careers** | `app/about/careers/page.tsx` | MISSING | LOW |
| **Press** | `app/about/press/page.tsx` | MISSING | LOW |
| **Contact** | `app/contact/page.tsx` | MISSING | LOW |
| **Experience** | `app/experience/page.tsx` | MISSING | LOW |
| **Legal Pages** | `app/legal/*` (3 pages) | MISSING | LOW |
| **Marketing Components** | `components/marketing/*` (6 files) | MISSING | LOW |
| **Landing Components** | `components/landing/*` (10 files) | MISSING | LOW |
| **Experience Components** | `components/experience/*` (6 files) | MISSING | LOW |

---

### 1.11 Demo & Testing Pages

#### Source Repo (9 pages)

| Feature | Location | Status in Target | Priority |
|---------|----------|------------------|----------|
| **Semantic Glow Demo** | `app/demo/semantic-glow/page.tsx` | MISSING | LOW |
| **Optimizations Demo** | `app/optimizations-demo/page.tsx` | MISSING | LOW |
| **HeroUI Test** | `app/heroui-test/page.tsx` | MISSING | LOW |
| **AGUI Test** | `app/agui-test/page.tsx` | MISSING | LOW |
| **Voice Navigation Showcase** | `app/(demo)/voice-navigation-showcase/page.tsx` | MISSING | LOW |
| **Showcase** | `app/showcase/page.tsx` | MISSING | LOW |
| **Showcase Components** | `components/showcase/*` (11 files) | MISSING | LOW |

---

## 2. COMPONENT COMPLEXITY ANALYSIS

### High Complexity Components (>15KB)

| Component | Size | Complexity | Migration Strategy |
|-----------|------|------------|-------------------|
| `voice-copilot-modal.tsx` | 38KB | Very High | Incremental migration |
| `compass-content.tsx` | 36KB | High | Feature decomposition |
| `marketplace-content.tsx` | 34KB | High | Feature decomposition |
| `appraisal-content.tsx` | 32KB | High | Already separate app |
| `haus-nav.tsx` | 30KB | Medium | Review and adapt |
| `advanced-search-filters.tsx` | 13KB | Medium | Review existing |
| `deephaus-content.tsx` | 67KB | Very High | Phased migration |
| `category-content.tsx` | 38KB | High | Feature decomposition |
| `provider-dashboard-content.tsx` | 40KB | High | Feature decomposition |

### Medium Complexity (5-15KB)

| Component | Size | Migration Strategy |
|-----------|------|-------------------|
| `buyers-agent-chat.tsx` | 9KB | Direct migration |
| `voice-orb.tsx` | 6KB | Review existing |
| `dashboard-content.tsx` | 9KB | Direct migration |
| `academy-content.tsx` | 17KB | Decompose |

---

## 3. DATABASE MIGRATION DETAILS

### Tables Requiring Creation

```typescript
// 1. dudReports - Trust/DUD database
defineTable({
  reportNumber: v.optional(v.number()),
  name: v.string(),
  slug: v.string(),
  category: v.string(),
  country: v.optional(v.string()),
  region: v.optional(v.string()),
  location: v.string(),
  rating: v.number(),
  reviewCount: v.number(),
  // ... full schema from source
})

// 2. providers - Marketplace providers
defineTable({
  businessName: v.string(),
  slug: v.string(),
  category: v.string(),
  description: v.string(),
  rating: v.number(),
  // ... full schema from source
})

// 3. compassListings - Map search
defineTable({
  title: v.string(),
  coordinates: v.object({ lat: v.number(), lng: v.number() }),
  price: v.number(),
  // ... full schema from source
})

// 4. marketCategories
defineTable({
  id: v.string(),
  name: v.string(),
  slug: v.string(),
  icon: v.string(),
  // ...
})

// 5. userProgress - Gamification
defineTable({
  userId: v.string(),
  xp: v.number(),
  level: v.number(),
  streak: v.number(),
  // ...
})

// 6. achievements
defineTable({
  id: v.string(),
  title: v.string(),
  description: v.string(),
  xpReward: v.number(),
  // ...
})

// 7. lessons
defineTable({
  id: v.string(),
  title: v.string(),
  category: v.string(),
  duration: v.number(),
  // ...
})

// 8. tenders
defineTable({
  name: v.string(),
  clientName: v.string(),
  deadline: v.float64(),
  status: v.optional(v.string()),
  // ...
})

// 9. tenderDocuments
defineTable({
  name: v.string(),
  tenderId: v.id("tenders"),
  type: v.string(),
  content: v.string(),
  // ...
})
```

---

## 4. API ENDPOINT MIGRATION PRIORITY

### Critical (Week 1-2)

| Endpoint | Purpose | Complexity |
|----------|---------|------------|
| `/api/agent` | Claude buyers agent | High |
| `/api/voice-search` | Voice search (review) | Medium |
| `/api/properties/search` | Property search | Medium |

### High Priority (Week 3-4)

| Endpoint | Purpose | Complexity |
|----------|---------|------------|
| `/api/compass/listings` | Map listings | Medium |
| `/api/market/providers` | Provider data | Low |
| `/api/dud/reports` | DUD reports | Medium |

### Medium Priority (Week 5-8)

| Endpoint | Purpose | Complexity |
|----------|---------|------------|
| `/api/academy/courses` | Academy data | Low |
| `/api/rooms/*` | Collaboration | Medium |
| `/api/tenders/*` | Document management | Medium |

---

## 5. HOOK MIGRATION PRIORITY

### Critical Hooks

| Hook | Purpose | Platform |
|------|---------|----------|
| `use-voice-navigation.ts` | Voice nav | Web |
| `use-voice-copilot-integration.ts` | Copilot | Web |
| `use-copilot-property-tools.ts` | Property AI | Both |

### High Priority Hooks

| Hook | Purpose | Platform |
|------|---------|----------|
| `use-scribe-realtime.ts` | Transcription | Both |
| `use-gsap-reveal.ts` | Animations | Web |
| `use-lenis.ts` | Smooth scroll | Web |

---

## 6. RISK ANALYSIS

### Critical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database schema incompatibility | HIGH | MEDIUM | Phased migration with validation |
| Auth system conflicts | HIGH | LOW | Test thoroughly, maintain backup |
| Component dependency issues | MEDIUM | HIGH | Bottom-up migration, storybook testing |
| Mobile/Web feature drift | MEDIUM | MEDIUM | Shared feature checklist |
| Performance regression | MEDIUM | MEDIUM | Benchmark testing |

---

## 7. RECOMMENDED MIGRATION ORDER

### Sprint 1-2: Foundation
1. Database schema alignment
2. Core Convex functions
3. Authentication verification

### Sprint 3-4: Core Property
1. Compass map search
2. Advanced search filters
3. Property detail enhancements

### Sprint 5-6: AI/Voice
1. Cedar voice system
2. AI elements components
3. Voice navigation

### Sprint 7-8: Marketplace
1. Provider system
2. Category browsing
3. Quote requests

### Sprint 9-10: Trust
1. DUD reports
2. Watchdog system

### Sprint 11-12: Academy
1. Course system
2. Gamification
3. First home features

### Sprint 13-14: User Features
1. Dashboard
2. Messages
3. Rooms/Collaboration

### Sprint 15-16: Agent Tools
1. Agent dashboard
2. Pipeline management

### Sprint 17-18: Tools
1. Calculators
2. Appraisal integration

### Sprint 19-20: Marketing
1. Content pages
2. Documentation

---

*End of Migration Analysis*
