# AGENTS.md - Backend Package (@v1/backend)

## Project Overview
Convex TypeScript backend for HAUS voice search app in Turborepo monorepo.
- Authentication: @convex-dev/auth
- Payments: Polar/Stripe (convex.config.ts), RevenueCat sync (users table)
- Property scraping: realestate.com.au (lib/realestate-com-au.ts, cheerio)
- AI/Memory: Cortex SDK (lib/cortex/), Neo4j graph sync
- Voice agents: Python LiveKit (agent-worker/)
- Key deps: convex@1.31.7, ai@6.0.67, openai@4.95.0, stripe@20.3.0, zod@3.25

## Essential Commands
```
bun install
bun run dev          # convex dev --tail-logs (hot reload)
bun run dev:once     # convex dev --once
bun run setup        # env setup + VALIDATE_ENV=true
bun run seed         # convex run init (seed data)
npx convex dashboard # View deployment
```

## Code Organization
```
convex/             # Convex functions/queries/mutations
├── schema.ts       # Hybrid HAUS+Cortex schema (users, conversations, memories)
├── users.ts        # User mutations (syncPremiumStatus, linkRevenueCatAccount)
├── revenuecatWebhooks.ts # RevenueCat webhook handler
├── propertyListings.ts  # Scraping + DB sync
├── cortex.ts       # Cortex memory integration
├── payments/       # Stripe helpers
└── _generated/     # Convex gen (api.d.ts, etc.)
lib/                # Shared utils
├── types.ts        # Zod schemas
├── revenuecat.ts   # RevenueCat helpers
├── realestate-com-au.ts # Cheerio scraper
├── cortex/client.ts # Cortex SDK client
└── logger.ts       # Structured logging
agent-worker/       # Python LiveKit voice agent (Dockerfile)
```

## Schema Key Tables (schema.ts)
- **users**: Auth (name/email), prefs (voice/search), RevenueCat (isPremium/premiumExpiresAt), Stripe (subscriptionTier), Cortex (memorySpaceId)
  - Indexes: email, memorySpaceId, revenueCatId, isPremium, stripeCustomerId, subscriptionTier
- **conversations**: Cortex convos (conversationId links to memorySpaceId)
- More: properties, listings (scraped data), etc.

## Naming/Style Conventions
- Validators: v() everywhere, Zod for inputs/webhooks
- TS: strict, ESNext, isolatedModules, noEmit
- Functions: domain-named files (users.ts, propertySync.ts)
- Logging: lib/logger.ts structured logs
- Comments: Block headers (━━━━━━━━━━━━━━━━━━━━━━━━)

## Build/Test/Lint
- No tests observed (glob **/*test*.ts → none)
- Typecheck: tsc --noEmit (via convex dev)
- Lint: None configured (add Biome?)

## Gotchas/Non-Obvious
- Polar config in convex.config.ts (Stripe subs)
- RevenueCat sync: users.syncPremiumStatus mutation (mobile → backend)
- Scraper: lib/realestate-com-au.ts (cheerio, data-testid selectors)
- Cortex: memorySpaceId per-user isolation
- No git repo (env: no)
- skip-convex.js: Wrapper for dev script

## Deployment
- `npx convex deploy`
- Env vars: convex env set (VALIDATE_ENV=true observed)

Updated: $(date)