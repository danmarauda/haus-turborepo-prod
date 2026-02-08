# HAUS Platform - Codebase Architecture Dossier

**Generated:** 2026-02-02  
**Repository:** HAUS Turborepo - Real Estate SaaS Platform  
**Classification:** SANITIZED - External Sharing Approved  

---

## 1. Repository Overview

### Primary Purpose
HAUS is a multi-platform real estate application providing property search, AI-powered voice assistance with persistent memory, marketplace features, and subscription-based services. Built for the Australian real estate market.

### Key Value Propositions
- **Property Search:** Advanced search with filters, voice interface, AI recommendations
- **Voice AI Assistant:** LiveKit-powered real-time voice agent with persistent memory (Cortex)
- **Memory & Personalization:** Learns suburb preferences, tracks property interactions, recalls context
- **Marketplace:** Service provider marketplace for real estate professionals
- **Multi-platform:** Web (Next.js), iOS/Android (Expo/React Native), shared backend (Convex)

### Runtime Architecture
- **Monorepo:** Turborepo with workspace packages
- **Frontend Apps:** Next.js 16.x (Web), Expo 55.x (Mobile)
- **Backend:** Convex (serverless database + functions)
- **AI/ML:** Multi-provider (OpenAI, Google Gemini, Anthropic)
- **Memory System:** Cortex with Neo4j knowledge graph

---

## 2. Directory Structure (Tree View - Depth 4)

```
.
├── .anytool/                      # Tool quality config
├── .github/workflows/             # GitHub Actions
├── .gitlab/                       # GitLab config
├── .vscode/                       # VS Code settings
├── tooling/
│   └── typescript/                # Shared TS configs
├── packages/
│   ├── analytics/                 # OpenPanel analytics (client/server)
│   ├── backend/
│   │   ├── convex/                # Convex functions & schema
│   │   │   ├── ai/                # AI chat/action functions
│   │   │   ├── email/             # Email handlers
│   │   │   ├── utils/             # Utility functions
│   │   │   ├── _generated/        # Convex generated code
│   │   │   ├── auth.ts            # Auth configuration
│   │   │   ├── cortex.ts          # Memory system functions
│   │   │   ├── cortexSchema.ts    # Memory schema extensions
│   │   │   ├── http.ts            # HTTP routes
│   │   │   ├── schema.ts          # Database schema
│   │   │   ├── users.ts           # User management
│   │   │   └── web.ts             # Web actions
│   │   ├── agent-worker/          # Python agent worker
│   │   └── lib/                   # Shared libraries
│   ├── email/                     # React Email templates
│   ├── logger/                    # Pino logging utilities
│   └── ui/                        # shadcn/ui + Radix components
└── apps/
    ├── app/                       # Main SaaS app (@v1/app) - Port 3000
    │   ├── src/
    │   │   ├── app/[locale]/      # i18n routing
    │   │   │   ├── (dashboard)/   # Protected routes
    │   │   │   ├── (public)/      # Public routes
    │   │   │   ├── agency/        # Agency page
    │   │   │   ├── market/        # Marketplace
    │   │   │   ├── onboarding/    # User onboarding
    │   │   │   ├── search/        # Property search
    │   │   │   └── warehaus/      # Warehaus feature
    │   │   ├── components/        # React components
    │   │   │   └── haus/          # HAUS-specific components
    │   │   ├── hooks/             # Custom React hooks
    │   │   ├── lib/               # Utilities
    │   │   ├── locales/           # i18n translations
    │   │   └── types/             # TypeScript types
    │   └── public/                # Static assets
    ├── web/                       # Marketing website (@v1/web) - Port 3001
    │   └── src/
    │       ├── app/               # Next.js app router
    │       ├── components/        # React components
    │       └── fonts/             # Custom fonts
    ├── appraisal/                 # Property appraisal tool (@haus/appraisal) - Port 3002
    │   └── src/
    │       ├── app/               # Next.js pages
    │       ├── components/        # Appraisal components
    │       └── lib/               # Utilities
    ├── mobile/                    # React Native mobile app (@haus/mobile) - Port 8081
    │   ├── app/                   # Expo Router file-based routing
    │   │   ├── (auth)/            # Auth screens
    │   │   ├── (tabs)/            # Main tab screens
    │   │   ├── onboarding/        # Onboarding flow
    │   │   └── property/          # Property detail
    │   ├── components/            # React Native components
    │   │   ├── academy/           # Learning academy
    │   │   ├── ai/                # AI chat components
    │   │   ├── chat/              # Chat interface
    │   │   ├── memory/            # Memory context UI
    │   │   ├── property/          # Property cards
    │   │   ├── search/            # Search UI
    │   │   ├── vault/             # Document vault
    │   │   └── voice/             # Voice components
    │   ├── context/               # React contexts
    │   ├── hooks/                 # Custom hooks
    │   ├── lib/                   # Utilities
    │   ├── locales/               # i18n
    │   ├── providers/             # App providers
    │   ├── services/              # API services
    │   └── types/                 # TypeScript types
    └── studio/                    # Vite-based studio/tool (@v1/studio)
        ├── components/            # Studio components
        ├── contexts/              # State contexts
        ├── hooks/                 # Custom hooks
        ├── lib/                   # Utilities
        └── services/              # API services
```

**Total Files in Repo:** ~458 tracked files

---

## 3. Technology Stack Inventory

### Core Frameworks
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | Web framework (app, web, appraisal) |
| React | 19.2.0 | UI library |
| React Native | 0.83.1 | Mobile framework |
| Expo | 55.0.0-preview.7 | Mobile SDK |
| Expo Router | 4.0.22 | Mobile routing |
| TypeScript | 5.9.3 | Type safety |

### Backend & Database
| Technology | Version | Purpose |
|------------|---------|---------|
| Convex | 1.31.7 | Serverless backend (DB, functions, auth) |
| @convex-dev/auth | 0.0.90 | Authentication |
| @convex-dev/polar | 0.2.0-alpha.5 | Billing/subscriptions |
| Neo4j | 5.25 | Knowledge graph (via Docker) |
| neo4j-driver | 6.0.1 | Neo4j client |

### AI/ML Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| ai (Vercel AI SDK) | 6.0.67 | AI orchestration |
| @ai-sdk/openai | 3.0.25 | OpenAI integration |
| @ai-sdk/react | 3.0.69 | React AI hooks |
| openai | 4.95.0 | OpenAI SDK |
| @cortexmemory/sdk | 0.36.0 | Memory system |

### UI & Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| TailwindCSS | 3.4.17 | Styling (kept v3 for compatibility) |
| shadcn/ui | latest | UI components |
| Radix UI | latest | Headless UI primitives |
| Lucide React | 0.563.0 | Icons |
| NativeWind | 4.2.1 | Tailwind for React Native |
| Framer Motion | various | Animations |

### Voice & Real-time
| Technology | Version | Purpose |
|------------|---------|---------|
| LiveKit | 2.9.6 | Voice/video rooms |
| @livekit/react-native | 2.9.6 | Mobile voice SDK |

### State Management
| Technology | Version | Purpose |
|------------|---------|---------|
| TanStack Query | 5.90.20 | Server state |
| Zustand | 5.0.10 | Client state (mobile) |
| nuqs | 2.6.1 | URL state (web) |

### Testing
| Technology | Version | Purpose |
|------------|---------|---------|
| Maestro | n/a | Mobile E2E testing |
| Biome | 1.9.4 | Linting/formatting |

### DevOps & Tooling
| Technology | Version | Purpose |
|------------|---------|---------|
| Turborepo | 2.8.1 | Monorepo build system |
| Bun | 1.1.26 | Package manager |
| Biome | 1.9.4 | Linting/formatting |

---

## 4. App Entry Points & Routing

### @v1/app (Main SaaS - Port 3000)
```
src/app/[locale]/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Landing/redirect
├── (dashboard)/
│   ├── layout.tsx          # Dashboard shell
│   ├── page.tsx            # Dashboard home
│   └── settings/           # Settings pages
├── (public)/
│   └── login/              # Auth pages
├── search/                 # Property search
├── market/                 # Marketplace
├── agency/                 # Agency portal
├── onboarding/             # User onboarding
└── warehaus/               # Warehaus feature
```

### @v1/web (Marketing - Port 3001)
```
src/app/
├── layout.tsx              # Marketing layout
├── page.tsx                # Landing page
└── [routes]                # Marketing routes
```

### @haus/mobile (Mobile App)
```
app/
├── _layout.tsx             # Root layout
├── (auth)/                 # Auth stack
│   ├── login.tsx
│   ├── register.tsx
│   └── welcome.tsx
├── (tabs)/                 # Main tab navigator
│   ├── _layout.tsx
│   ├── index.tsx           # Home
│   ├── search.tsx          # Search
│   ├── voice.tsx           # Voice agent
│   ├── ai-chat.tsx         # AI chat
│   ├── favorites.tsx       # Saved properties
│   └── ...
├── property/
│   └── [id].tsx            # Property detail
└── onboarding/             # Onboarding flow
```

### API Routes (Convex HTTP)
```
HTTP Endpoints (packages/backend/convex/http.ts):
├── /api/auth/*             # Convex Auth (Google OAuth)
├── /polar/events           # Polar billing webhooks
├── /api/ai/chat            # AI chat
├── /api/ai/chat/stream     # Streaming chat
├── /api/ai/analyze-property # Property image analysis
├── /api/ai/summarize-property
├── /api/ai/market-insights
├── /api/ai/chat/tools      # Tool-calling chat
└── /api/health             # Health check
```

---

## 5. Data Layer Summary

### Database: Convex
**Schema Location:** `packages/backend/convex/schema.ts`

**Core Tables:**
| Table | Purpose |
|-------|---------|
| `users` | Auth + HAUS user data + preferences |
| `propertyListings` | Property listings from external sources |
| `collaborativeRooms` | Multi-user collaboration spaces |
| `propertyUploads` | User-uploaded property data |

### Cortex Memory System
**Schema Extensions:** `packages/backend/convex/cortexSchema.ts`

| Table | Purpose |
|-------|---------|
| `conversations` | Immutable voice/chat history |
| `memories` | Vector embeddings for semantic search |
| `facts` | Extracted user preferences |
| `propertyMemories` | Property view/search history |
| `suburbPreferences` | Learned suburb affinities (-100 to +100) |
| `memorySpaces` | Per-user isolation |
| `contexts` | Hierarchical coordination |
| `agents` | Agent registry |
| `sessions` | Session management |
| `graphSyncQueue` | Neo4j sync queue |

### Key Convex Functions
```typescript
// Cortex Memory
cortex.rememberVoiceSearch    // Store voice interaction
cortex.recallForQuery         // Retrieve relevant context
cortex.storePreference        // Store learned preference

// Users
users.getCurrentUser          // Get authenticated user
users.updateUser              // Update user profile

// Properties
propertyUploads.uploadProperty // Upload property data

// Auth
auth.signIn                   // Google OAuth
auth.signOut                  // Sign out
```

### External Data Stores
- **Neo4j:** Knowledge graph for Property ↔ Suburb ↔ Agent relationships
  - Docker Compose: `docker-compose.neo4j.yml`
  - Default: `bolt://localhost:7687`

---

## 6. Auth & RBAC Summary

### Authentication Provider
- **Primary:** Google OAuth via `@convex-dev/auth`
- **Config:** `packages/backend/convex/auth.ts`
- **Flow:** OAuth → Convex Auth → Session token

### Mobile Auth
- JWT-based with `expo-secure-store`
- Custom token management in `apps/mobile/services/auth/`

### RBAC (Collaborative Rooms)
```typescript
roles: "owner" | "admin" | "member" | "viewer" | "guest"
```

### Protected Patterns
- Dashboard routes: `(dashboard)/` - requires authentication
- Public routes: `(public)/` - unauthenticated access
- Middleware: `apps/app/src/middleware.ts` - i18n + auth checks

---

## 7. External Integrations

### Payments & Billing
| Service | Integration | Purpose |
|---------|-------------|---------|
| Polar | `@convex-dev/polar` | Subscriptions, billing |
| RevenueCat | `react-native-purchases` | Mobile subscriptions |
| Stripe | `@stripe/stripe-react-native` | Payment processing (mobile) |

### AI Providers
| Service | Key Env Var | Purpose |
|---------|-------------|---------|
| OpenAI | `OPENAI_API_KEY` | Embeddings, chat, analysis |
| Google Gemini | `GOOGLE_GENERATIVE_AI_API_KEY` | Studio, mobile AI |
| Anthropic | `ANTHROPIC_API_KEY` | Alternative LLM |
| ElevenLabs | `ELEVENLABS_API_KEY` | TTS (optional) |

### Analytics & Observability
| Service | Key Env Var | Purpose |
|---------|-------------|---------|
| OpenPanel | `OPENPANEL_SECRET_KEY` | Analytics server |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN` | Error tracking |
| PostHog | n/a | Product analytics (referenced) |

### Email
| Service | Key Env Var | Purpose |
|---------|-------------|---------|
| Resend | `RESEND_API_KEY` | Transactional email |
| Loops | `LOOPS_FORM_ID` | Marketing email (optional) |

### Real-time Voice
| Service | Key Env Var | Purpose |
|---------|-------------|---------|
| LiveKit | `EXPO_PUBLIC_LIVEKIT_URL` | Voice rooms |

### Infrastructure
| Service | Key Env Var | Purpose |
|---------|-------------|---------|
| Convex | `NEXT_PUBLIC_CONVEX_URL` | Backend platform |
| Neo4j | `NEO4J_URI` | Knowledge graph |

### Third-party APIs
- **Domain.com.au / realestate.com.au:** Property listing sources
- **Cal.com:** Scheduling integration (`NEXT_PUBLIC_CAL_LINK`)
- **Firebase:** Studio app only (config in `apps/studio/lib/firebase.ts`)

---

## 8. Deployment & Infrastructure

### Platforms
| App | Platform | URL Pattern |
|-----|----------|-------------|
| @v1/app | Vercel | https://app.haus.io |
| @v1/web | Vercel | https://haus.io |
| @haus/appraisal | Vercel | https://appraisal.haus.io |
| @haus/mobile | EAS | App Store / Play Store |
| @v1/backend | Convex | https://*.convex.cloud |

### CI/CD Pipeline (GitLab)
**Stages:** install → validate → test → build → deploy-preview → deploy-staging → deploy-production

**Triggers:**
- Merge Requests → Preview deployments (auto-stop after 3 days)
- `staging` branch → Staging deployments
- `main` branch → Production deployments (manual)

### Railway (Optional Services)
- Configuration: `railway.toml`
- Supports: Redis, PostgreSQL, custom services

### Mobile CI/CD (EAS)
- Preview builds on MR changes to mobile/
- Staging/production builds manual trigger

---

## 9. Observability

### Error Tracking (Sentry)
**Config Files:**
- `apps/app/sentry.client.config.ts`
- `apps/app/sentry.server.config.ts`
- `apps/app/sentry.edge.config.ts`

**Features:**
- Automatic error capture
- Source maps (hidden in production)
- Performance monitoring

### Analytics (OpenPanel)
**Location:** `packages/analytics/`

**Features:**
- Client-side tracking
- Server-side events
- User journey analytics

### Logging
**Location:** `packages/logger/`

**Features:**
- Pino-based logging
- Environment-aware log levels
- Structured logging support

### Health Checks
- Endpoint: `/api/health` (Convex HTTP)
- Returns: `{ status: "ok", timestamp: number }`

---

## 10. Testing Strategy

### Current State
- **Coverage:** Minimal (placeholder tests)
- **CI Test Job:** Allows failure (`echo "No tests configured yet"`)

### E2E Testing (Mobile)
**Framework:** Maestro
**Location:** `apps/mobile/.maestro/`

**Test Flows:**
```
01-onboarding.yaml    # Onboarding flow
02-signup.yaml        # Sign up
03-signin.yaml        # Sign in
04-tabs.yaml          # Tab navigation
05-settings.yaml      # Settings
06-premium.yaml       # Premium features
smoke-test.yaml       # Basic smoke test
```

### Linting & Formatting
**Tool:** Biome
**Config:** `biome.json`

**Rules:**
- Recommended rules enabled
- `noSvgWithoutTitle`: off
- `noNonNullAssertion`: off
- `useExhaustiveDependencies`: off
- `noForEach`: off

### Type Checking
- Strict TypeScript across all packages
- Convex generates types from schema

---

## 11. Security Posture

### Secret Storage
- **Development:** `.env.local` files (gitignored)
- **Production:** Vercel env vars, Convex dashboard env vars
- **CI:** GitLab CI variables

### Environment Variables Expected
**Web/App:**
```
NEXT_PUBLIC_CONVEX_URL
NEXT_PUBLIC_OPENPANEL_CLIENT_ID
NEXT_PUBLIC_SENTRY_DSN
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_CAL_LINK
PORT
VERCEL_URL
```

**Backend (Convex):**
```
CONVEX_DEPLOYMENT
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
POLAR_ORGANIZATION_TOKEN
POLAR_WEBHOOK_SECRET
RESEND_API_KEY
RESEND_SENDER_EMAIL_AUTH
LOOPS_FORM_ID
OPENPANEL_SECRET_KEY
OPENAI_API_KEY
CORTEX_EMBEDDING
CORTEX_FACT_EXTRACTION
CORTEX_GRAPH_SYNC
NEO4J_URI
NEO4J_USERNAME
NEO4J_PASSWORD
GOOGLE_GENERATIVE_AI_API_KEY
GEMINI_API_KEY
ANTHROPIC_API_KEY
ELEVENLABS_API_KEY
CORTEX_TENANT_ID
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
```

**Mobile:**
```
EXPO_PUBLIC_CONVEX_URL
EXPO_PUBLIC_LIVEKIT_URL
EXPO_PUBLIC_OPENPANEL_CLIENT_ID
EXPO_PUBLIC_SENTRY_DSN
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
EXPO_PUBLIC_RC_IOS
EXPO_PUBLIC_RC_ANDROID
EXPO_PUBLIC_RC_SUBSCRIPTION_NAME
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_JWT_SECRET
```

### Security Considerations
1. **JWT Secret:** Mobile has fallback default (should be changed in production)
2. **Firebase Config:** Studio app has placeholder values
3. **API Keys:** Multiple AI providers configured
4. **CORS:** Configured in Convex HTTP routes
5. **Rate Limiting:** Implemented in `apps/app/src/lib/rate-limit.ts` (Upstash)

### Risk Areas
- Mobile JWT secret fallback in development
- Some TODO comments indicate incomplete auth flows

---

## 12. How to Run Locally

### Prerequisites
- Bun 1.1.26+
- Node.js 20+ (for some tools)
- Docker (for Neo4j - optional)

### Quick Start
```bash
# 1. Install dependencies
bun install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your values

# 3. Start Convex backend
cd packages/backend
bun run setup  # Creates project, may fail on first run

# 4. Start development
bun dev        # Starts all apps in parallel

# Or start specific apps:
bun dev:web    # Marketing site (port 3001)
bun dev:app    # Main app (port 3000)
bun dev:mobile # Mobile (Expo)
```

### Neo4j (Optional)
```bash
docker-compose -f docker-compose.neo4j.yml up -d
```

### Mobile Development
```bash
cd apps/mobile
bun run dev:ios      # iOS simulator
bun run dev:android  # Android emulator
bun run dev:web      # Web preview
```

---

## 13. TODOs / Roadmap Hints

### Active TODOs from Code
| File | TODO | Priority |
|------|------|----------|
| `apps/mobile/hooks/useProperties.ts:33` | Replace with Convex query once backend is ready | Medium |
| `apps/mobile/hooks/useProperties.ts:42` | Replace with Convex query once backend is ready | Medium |
| `apps/app/src/lib/error-handler.ts:208` | Integrate with security monitoring service | Medium |
| `apps/mobile/app/(auth)/reset-password.tsx:37` | Implement Convex password reset | Medium |
| `apps/mobile/app/property/[id].tsx:117` | Implement share functionality | Low |

### Migration Status
- **Backend Migration:** tRPC/Hono → Convex (COMPLETE)
- **Mobile SDK:** Expo 54 → 55 (IN PROGRESS - preview.7)
- **Known Issues:**
  - Radix UI type compatibility with React 19
  - 131 pre-existing lint errors (unrelated to upgrades)

### Feature Flags / Config
- Cortex embedding/fact extraction configurable via env vars
- Multi-tenancy support via `CORTEX_TENANT_ID`

---

## Appendix A: File Manifest (Key Files)

### Configuration
- `package.json` - Root package.json
- `turbo.json` - Turborepo config
- `biome.json` - Linting/formatting config
- `.gitlab-ci.yml` - CI/CD pipeline
- `railway.toml` - Railway deployment config

### App Configs
- `apps/app/next.config.mjs`
- `apps/app/src/env.mjs`
- `apps/web/next.config.mjs`
- `apps/web/src/env.ts`
- `apps/mobile/app.json`
- `apps/mobile/eas.json`

### Backend
- `packages/backend/convex/schema.ts`
- `packages/backend/convex/auth.ts`
- `packages/backend/convex/http.ts`
- `packages/backend/convex/cortex.ts`

### Documentation
- `README.md` - Main documentation
- `AGENTS.md` - Agent-specific documentation
- `MIGRATION_ANALYSIS.md` - Migration notes
- `apps/mobile/INTEGRATION_COMPLETE.md` - Mobile integration status

---

**END OF DOSSIER**

*This document is sanitized for external sharing. All secrets, credentials, and sensitive values have been redacted or removed.*
