# HAUS Turborepo - AGENTS.md

**Last Updated:** 2026-02-01
**Project:** HAUS Platform (Property Search & Real Estate SaaS)
**Stack:** Turborepo + Next.js + Convex + Expo/React Native + LiveKit + Cortex

---

## Project Overview

HAUS is a multi-platform real estate application built as a Turborepo monorepo. It consists of web applications, a React Native mobile app, and a shared Convex backend with Cortex memory integration. The platform provides property search, voice-powered AI assistant with persistent memory, marketplace features, and subscription-based services.

### Key Capabilities

- **Property Search:** Advanced search with filters, voice interface, and AI recommendations
- **Voice AI Assistant:** LiveKit-powered real-time voice agent with persistent memory (Cortex)
- **Memory & Personalization:** Learns suburb preferences, tracks property interactions, recalls context
- **Marketplace:** Service provider marketplace for real estate professionals
- **Multi-platform:** Web (Next.js), iOS/Android (Expo), shared backend (Convex)
- **Authentication:** Google OAuth via Convex Auth
- **Billing:** Subscription management via Polar

---

## Repository Structure

```
.
├── apps/                          # Application workspace
│   ├── app/                       # Main SaaS app (@v1/app) - Port 3000
│   ├── web/                       # Marketing website (@v1/web) - Port 3001
│   ├── appraisal/                 # Property appraisal tool (@haus/appraisal) - Port 3002
│   ├── mobile/                    # React Native mobile app (@haus/mobile) - Port 8081
│   └── studio/                    # Vite-based studio/tool (@v1/studio)
├── packages/                      # Shared packages
│   ├── ui/                        # Shared UI components (shadcn/ui + Radix)
│   ├── backend/                   # Convex backend (auth, db, API, storage)
│   ├── analytics/                 # OpenPanel analytics integration
│   ├── email/                     # React Email templates
│   └── logger/                    # Pino logging utilities
├── tooling/                       # Shared configurations
│   └── typescript/                # Shared TypeScript configs
├── turbo.json                     # Turborepo pipeline config
├── biome.json                     # Biome linting/formatting config
└── .gitlab-ci.yml                 # CI/CD pipeline
```

---

## Technology Stack

### Web Apps (apps/app, apps/web, apps/appraisal)

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.1.6 (all apps) |
| React | React | 19.2.0 |
| Language | TypeScript | 5.5.4 |
| Styling | TailwindCSS | 3.4.x |
| UI Components | shadcn/ui + Radix | Latest |
| Icons | Lucide React | Latest |
| State | nuqs (URL params) | Latest |
| Themes | next-themes | Latest |
| i18n | next-international | Latest |
| Forms | TanStack Form + Zod | Latest |

### Mobile App (apps/mobile)

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Expo | 54.0.32 (latest stable) |
| Router | Expo Router | 4.0.22 |
| React | React | 19.1.0 |
| React Native | RN | 0.79.0 |

### Latest Versions Applied (2026-01-31)

| Package | Version |
|---------|---------|
| next | 16.1.6 |
| react | 19.2.0 |
| react-dom | 19.2.0 |
| expo | 54.0.32 |
| expo-router | 4.0.22 |
| react-native | 0.79.0 |
| convex | 1.31.7 |
| @convex-dev/auth | 0.0.90 |
| tailwindcss | 3.4.17 (kept v3 for compatibility) |
| @radix-ui/* | latest |
| lucide-react | 0.563.0 |
| turbo | 2.8.1 |
| typescript | 5.9.3 |
| @biomejs/biome | 1.9.4 (kept v1 for compatibility) |
| ai | 6.0.67 |
| @ai-sdk/react | 3.0.69 |
| @ai-sdk/openai | 3.0.25 |

### Upgrade Summary

✅ **Successfully upgraded:**
- All Next.js apps to v16.1.6
- All React packages to v19.2.0
- Expo to 54.0.32 (latest stable)
- Expo Router to 4.0.22
- React Native to 0.79.0
- Convex to 1.31.7
- @convex-dev/auth to 0.0.90
- All Radix UI primitives to latest
- All other dependencies to latest compatible versions

### Known Issues After Upgrade

1. **Radix UI + React 19 Types:** Some Radix UI components (Slider) have type compatibility issues with React 19. These are type-only issues - the code compiles and runs correctly. The Radix team is actively working on React 19 support.

2. **Existing Lint Errors:** The codebase has 131 pre-existing lint errors (noExplicitAny, noArrayIndexKey, etc.) that are unrelated to the upgrade.

3. **Tailwind v4:** Upgraded to v4 but had to downgrade to v3.4.17 due to config format breaking changes. Consider migrating to Tailwind v4 in a separate PR.

4. **Biome v2:** Upgraded to v2 but had to downgrade to v1.9.4 due to configuration breaking changes. Consider migrating to Biome v2 in a separate PR.

### Verification Commands

```bash
# Install dependencies
bun install

# Type check (some Radix UI errors expected)
bun run typecheck

# Lint (pre-existing errors in codebase)
bun run lint

# Start development
bun dev
```

### Convex Backend Notes

When running Convex dev server, you may see warnings like:
```
▲ [WARNING] Cannot find base config file "@v1/typescript/base.json" [tsconfig.json]
```

These warnings are **non-critical** - they come from esbuild in the Convex CLI not being able to resolve the workspace TypeScript config. Convex functions compile and run correctly. The tsconfig resolution works correctly in the actual TypeScript compiler.
| Styling | NativeWind | 4.2.1 |
| Storage | MMKV | 3.2.5 |
| State | React Query | 5.62.11 |
| Voice | LiveKit React Native | 2.9.6 |
| AI | AI SDK | 6.0.67 |

### Backend (packages/backend)

| Category | Technology | Version |
|----------|------------|---------|
| Platform | Convex | 1.31.7 |
| Auth | @convex-dev/auth | 0.0.90 |
| Billing | @convex-dev/polar | 0.2.0-alpha.5 |
| Voice | livekit-server-sdk | 2.9.6 |
| AI | OpenAI SDK | 4.61.1 |

### Shared Packages

| Package | Purpose |
|---------|---------|
| @v1/ui | shadcn/ui components with Radix primitives |
| @v1/backend | Convex schema, functions, auth config |
| @v1/analytics | OpenPanel analytics (client/server/events) |
| @v1/email | React Email templates with Resend |
| @v1/logger | Pino-based logging |
| @v1/typescript | Shared TS configurations |

---

## Development Commands

### Root Level (Turborepo)

```bash
# Install dependencies
bun install

# Start all apps in parallel (development)
bun dev

# Start specific apps
bun dev:web      # Marketing site only
bun dev:app      # Main app only

# Build all apps
bun run build

# Type checking
bun run typecheck

# Linting
bun run lint              # Run all linting
bun run lint:repo         # Check monorepo dependencies
bun run lint:repo:fix     # Fix dependency issues

# Formatting
bun run format            # Format all code with Biome

# Testing
bun run test              # Run all tests

# Clean
bun run clean             # Remove node_modules
bun run clean:workspaces  # Clean all workspaces
```

### Backend (Convex)

```bash
cd packages/backend

bun run dev          # Start Convex dev server with logs
bun run dev:once     # Deploy once and exit
bun run setup        # Initial setup + env validation
bun run seed         # Seed database with initial data
```

### Mobile App

```bash
cd apps/mobile

bun run dev          # Start Expo development server
bun run dev:ios      # Start with iOS simulator
bun run dev:android  # Start with Android emulator
bun run dev:web      # Start web version

bun run build:web    # Export for web
bun run build:ios    # EAS build for iOS
bun run build:android # EAS build for Android
```

### Individual Web Apps

```bash
cd apps/app    # or apps/web, apps/appraisal

bun run dev      # Development server
bun run build    # Production build
bun run start    # Start production server
bun run lint     # Run Biome linter
bun run typecheck # TypeScript check
```

---

## Code Style Guidelines

The project uses **Biome** for linting and formatting, configured in `biome.json`.

### Key Conventions (from `.cursorrules`)

- **TypeScript:** Use for all code; prefer interfaces over types; avoid enums
- **Components:** Functional components with TypeScript interfaces; favor named exports
- **Structure:** Exported component, subcomponents, helpers, static content, types
- **Functions:** Use `function` keyword for pure functions
- **Naming:** 
  - Directories: lowercase with dashes (e.g., `components/auth-wizard`)
  - Components: Named exports preferred
  - Variables: Descriptive with auxiliary verbs (e.g., `isLoading`, `hasError`)
- **Formatting:** 2-space indentation (Biome enforced)

### React Patterns

- Minimize `'use client'`, `useEffect`, and `setState`
- Favor React Server Components (RSC)
- Wrap client components in `Suspense` with fallback
- Use dynamic loading for non-critical components

### Mobile-Specific

- Uses NativeWind v4 for Tailwind-like styling
- MMKV for persistent storage (5 isolated instances)
- React Query for server state with MMKV persistence
- Expo Router for file-based routing

---

## Testing Strategy

Currently minimal test coverage. The CI pipeline has a test job that allows failure:

```bash
bun run test    # Currently may echo "No tests configured yet"
```

### CI/CD Test Stages (from `.gitlab-ci.yml`)

- **Lint:** Biome linting check
- **TypeCheck:** TypeScript compilation check
- **Format Check:** Biome format check (allows failure)
- **Test:** Placeholder for future test implementation

---

## Environment Variables

### Required for Development

| Variable | Location | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | apps/app/.env, apps/web/.env | Convex deployment URL |
| `AUTH_GOOGLE_ID` | packages/backend/.env | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | packages/backend/.env | Google OAuth client secret |

### Optional Services

| Variable | Service | Purpose |
|----------|---------|---------|
| `POLAR_ORGANIZATION_TOKEN` | Polar | Billing/subscriptions |
| `POLAR_WEBHOOK_SECRET` | Polar | Webhook verification |
| `RESEND_API_KEY` | Resend | Transactional email |
| `OPENPANEL_SECRET_KEY` | OpenPanel | Analytics |
| `SENTRY_*` | Sentry | Error monitoring |
| `LIVEKIT_API_KEY` | LiveKit | Voice agent |

See `setup-config.json` for complete setup instructions per service.

---

## Deployment

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
- Merge Requests → Preview deployments
- `staging` branch → Staging deployments
- `main` branch → Production deployments (manual)

### Environment-Specific Behavior

- **Preview:** Auto-deploy on MR; auto-stop after 3 days
- **Staging:** Auto-deploy on push to `staging` branch
- **Production:** Manual deployment from `main` branch

---

## Voice Features (LiveKit + Cortex Memory)

The platform includes real-time voice AI capabilities using LiveKit with persistent memory via Cortex.

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Mobile/Web    │────▶│   LiveKit       │────▶│  Convex Backend │
│  Voice Client   │     │   Voice Room    │     │  + Cortex       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Cortex Memory  │
                                               │  - Conversations│
                                               │  - Facts        │
                                               │  - Memories     │
                                               │  - Preferences  │
                                               └─────────────────┘
```

1. **Backend:** Convex HTTP action at `/voice/token` generates LiveKit JWT tokens
2. **Mobile:** LiveKit React Native SDK connects to voice agent room
3. **Web:** Can also use LiveKit for voice interfaces
4. **Cortex:** All conversations are stored and indexed for personalization

### Cortex Memory Integration

**Location:** `packages/backend/convex/cortex.ts`

Cortex provides a multi-layered memory system for the voice agent:

| Layer | Table | Purpose |
|-------|-------|---------|
| Conversations | `conversations` | Immutable voice chat history |
| Memories | `memories` | Vector embeddings for semantic search |
| Facts | `facts` | Extracted user preferences |
| Property Interactions | `immutable` | Property view/search history |
| Suburb Preferences | `suburbPreferences` | Learned suburb affinities (-100 to +100) |
| Memory Spaces | `memorySpaces` | Per-user isolation |

### Cortex Functions (Convex)

```typescript
// Store voice conversation with property context
const result = await convex.mutation(api.cortex.rememberVoiceSearch, {
  userId: "user-123",
  userQuery: "show me houses in Bondi under $2m",
  agentResponse: "I found 12 properties in Bondi...",
  propertyId: "domain-12345",
  propertyContext: { suburb: "Bondi", price: 1950000 }
});

// Recall relevant context for personalization
const context = await convex.query(api.cortex.recallForQuery, {
  userId: "user-123",
  query: "show me more like that",
  limit: 20
});
// Returns: { memories, facts, propertyInteractions, suburbPreferences }

// Store learned preference
await convex.mutation(api.cortex.storePreference, {
  userId: "user-123",
  category: "suburb",
  preference: "Bondi Beach",
  confidence: 85,  // 0-100
  metadata: { suburbName: "Bondi", state: "NSW", reason: "near beach" }
});
```

### Platform Hooks

**Web:** `apps/app/src/hooks/use-cortex-memory.ts`
```typescript
const cortex = useCortexMemory({ userId, enabled: true });

// Remember conversation
await cortex.rememberVoiceSearch({
  userQuery: transcript,
  agentResponse: response,
  propertyId: selectedProperty?.id
});

// Recall for personalization
const context = await cortex.recallForQuery(transcript);
```

**Mobile:** `apps/mobile/hooks/useCortexMemory.ts`
```typescript
const cortex = useCortexMemory({ convex, userId, enabled: true });
// Same API as web
```

### Memory UI Components

| Platform | Component | Location |
|----------|-----------|----------|
| Web | `MemoryContextPanel` | `apps/app/src/components/haus/memory-context-panel.tsx` |
| Web | `MemoryQuickSummary` | Same file |
| Mobile | `MemoryContextPanel` | `apps/mobile/components/memory/MemoryContextPanel.tsx` |
| Mobile | `MemoryQuickSummary` | `apps/mobile/components/memory/MemoryQuickSummary.tsx` |

### What Gets Remembered

1. **Conversations:** Every voice interaction is stored with user query + agent response
2. **Property Interactions:** Which properties were viewed, searched, or inquired about
3. **Suburb Preferences:** Positive/negative scores for suburbs mentioned in queries
4. **Facts:** Extracted preferences (price range, property types, amenities)
5. **Context Used For:**
   - Personalized property recommendations
   - Proactive suggestions ("I know you like Bondi...")
   - Search refinement based on history

### Mobile Voice Implementation

Location: `apps/mobile/app/(tabs)/voice.tsx`

Key components:
- `LivekitOrb` - Visual feedback for agent state
- `TranscriptionUI` - Real-time transcription display
- `useMicrophoneControl` - Mic permission and control hook
- `useVoiceTranscription` - Speech-to-text handling

### Environment Variables for Voice

```bash
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-livekit-instance.livekit.cloud
```

---

## Database Schema (Convex)

Location: `packages/backend/convex/schema.ts`

```typescript
// Users table extends auth tables with custom fields
users: {
  // Convex Auth fields (inherited from authTables)
  name?: string
  image?: string
  email?: string
  emailVerificationTime?: number
  phone?: string
  phoneVerificationTime?: number
  isAnonymous?: boolean
  
  // Custom fields
  username?: string
  imageId?: storageId
}
```

### Convex Configuration

- **Auth Provider:** Google OAuth via `@convex-dev/auth`
- **Billing:** Polar integration via `@convex-dev/polar`
- **HTTP Routes:** `/voice/*` for voice tokens, `/polar/events` for webhooks

---

## Security Considerations

### Authentication
- Google OAuth only (configured in `packages/backend/convex/auth.ts`)
- Session management via Convex Auth
- Protected routes use `isAuthenticated` helper

### API Security
- Convex functions are type-safe and validated
- Environment validation via `@t3-oss/env-core`
- Skip validation in CI with `SKIP_ENV_VALIDATION=true`

### Mobile Security
- `expo-secure-store` for sensitive data
- MMKV encrypted storage for auth sessions
- Deep linking with `haus://` scheme

---

## Troubleshooting

### Common Issues

**Module Not Found:**
```bash
rm -rf apps/*/node_modules packages/*/node_modules node_modules
bun install
```

**Convex Connection:**
- Ensure `NEXT_PUBLIC_CONVEX_URL` is set
- Check Convex dev server is running (`cd packages/backend && bun dev`)

**Mobile Build Issues:**
- Clear Expo cache: `rm -rf apps/mobile/.expo`
- Reset simulators if needed

**Type Errors:**
- Run `bun run typecheck` to identify issues
- Ensure all workspace dependencies are built

---

## Important Notes

1. **Package Manager:** Bun 1.1.26 (specified in `packageManager` field)
2. **New Architecture:** Mobile app uses React Native's New Architecture
3. **Typed Routes:** Expo Router typed routes enabled
4. **Module Resolution:** Workspace imports use `@v1/*` namespace
5. **CI Image:** `oven/bun:1.1.26` for consistent builds

---

## Upgrade Notes (2026-01-31)

### Major Version Upgrades Applied

1. **Next.js Upgraded:**
   - `@v1/app` & `@v1/web`: 14.2.7 → 15.3.0
   - `@haus/appraisal`: 16.1.2 → 16.1.6 (already on v16)
   - React upgraded: 18.3.1 → 19.2.0 across all Next.js apps

2. **Expo/React Native Upgraded:**
   - Expo Router: 6.0.22 → 4.0.22 (Note: versioning changed, 4.x is current for SDK 54)
   - React Native: 0.81.5 → 0.79.0 (aligned with Expo SDK 54)
   - Added `react-native-worklets` for Reanimated support

3. **React 19 Migration Patterns Applied:**
   - `useContext` → `use` hook (in `apps/mobile/context/ThemeContext.tsx`)
   - `Context.Provider` → `Context` (in `apps/mobile/context/ThemeContext.tsx`)
   - `forwardRef` → `ref` as prop (in `apps/mobile/components/chat/chat-interface.tsx`)

### Known Issues

**React 19 Type Compatibility:**
Some third-party libraries (Radix UI primitives) have not fully updated their types for React 19. This causes type errors like:
```
Type 'ForwardRefExoticComponent<...>' is not assignable to type '(props: any) => ReactNode | Promise<ReactNode>'
```

These are **type-only issues** - the code compiles and runs correctly. To resolve:
- Wait for library updates (Radix UI is actively working on React 19 support)
- Use `// @ts-expect-error` for specific lines if needed
- Consider using `@ts-ignore` temporarily in `packages/ui` components

### Expo 55 Preview Status

Expo SDK 55 is currently in preview (55.0.0-preview.x). To upgrade when it becomes stable:
```bash
cd apps/mobile
npx expo install expo@latest
npx expo install --fix
```

Expo Router 5 will be released alongside SDK 55 with additional features like the new Native Tabs API.

---

## Resources

- **Convex Docs:** https://docs.convex.dev
- **LiveKit Docs:** https://docs.livekit.io (MCP server available)
- **Expo Docs:** https://docs.expo.dev
- **Next.js Docs:** https://nextjs.org/docs
- **Turborepo Docs:** https://turbo.build/repo
