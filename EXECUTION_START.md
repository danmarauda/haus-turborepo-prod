# HAUS Migration - EXECUTION START

**🚀 READY TO BEGIN - Immediate Action Items**

---

## TODAY'S PRIORITIES (Day 1)

### Backend Agent - START HERE

```bash
# 1. Navigate to backend
cd /Users/alias/Desktop/haus-voice-search/_external/haus-turborepo-prod/packages/backend

# 2. Open schema.ts
open convex/schema.ts

# 3. Copy from schema_additions.ts
cat convex/schema_additions.ts

# 4. Add the 9 table definitions to schema.ts
# Place them inside defineSchema({...}) before the closing })

# 5. Start Convex dev server
bun run dev

# 6. Verify in dashboard
open https://dashboard.convex.dev
```

**Tables to add (in order):**
1. ✅ dudReportsTable
2. ✅ providersTable  
3. ✅ compassListingsTable
4. ✅ marketCategoriesTable
5. ✅ userProgressTable
6. ✅ achievementsTable
7. ✅ lessonsTable
8. ✅ tendersTable
9. ✅ tenderDocumentsTable

**Day 1 Goal:** All 9 tables created and visible in Convex dashboard

---

### Web Agent - START HERE

```bash
# 1. Navigate to web app
cd /Users/alias/Desktop/haus-voice-search/_external/haus-turborepo-prod/apps/app

# 2. Review existing components
ls -la src/components/

# 3. Start dev server
bun dev

# 4. Open browser
open http://localhost:3000

# 5. Review component inventory
cat ../../COMPONENT_INVENTORY.md | grep -A 5 "Priority: CRITICAL"
```

**Day 1 Goals:**
- [ ] Understand existing component structure
- [ ] Identify first component to migrate
- [ ] Set up development environment

**First components to review:**
- `src/components/haus/voice-copilot-modal.tsx` (43KB)
- `src/components/advanced-search-filters.tsx` (13KB)
- `src/components/property-results.tsx` (9KB)

---

### Mobile Agent - START HERE

```bash
# 1. Navigate to mobile app
cd /Users/alias/Desktop/haus-voice-search/_external/haus-turborepo-prod/apps/mobile

# 2. Review existing screens
ls -la app/(tabs)/

# 3. Start dev server
bun dev:ios  # or bun dev:android

# 4. Review feature gaps
cat ../../MIGRATION_STATUS.md | grep -A 30 "## MOBILE FEATURE PARITY GAPS"
```

**Day 1 Goals:**
- [ ] Understand existing screen structure
- [ ] Identify missing features
- [ ] Set up development environment

**Priority features to add:**
- Compass map screen
- DUD report display
- Voice navigation

---

### UI Agent - START HERE

```bash
# 1. Navigate to UI package
cd /Users/alias/Desktop/haus-voice-search/_external/haus-turborepo-prod/packages/ui

# 2. Review existing components
ls -la src/components/

# 3. Compare with source
cat ../../COMPONENT_INVENTORY.md | grep -A 20 "### 8.1 Base UI"
```

**Day 1 Goals:**
- [ ] Audit existing UI primitives
- [ ] Identify missing components
- [ ] Review design tokens

---

## WEEK 1 SPRINT BOARD

### Sprint Goal: Foundation Complete

| Task | Assignee | Status | Day |
|------|----------|--------|-----|
| Add dudReports table | Backend | 🔴 | 1 |
| Add providers table | Backend | 🔴 | 1 |
| Add compassListings table | Backend | 🔴 | 1 |
| Add gamification tables | Backend | 🔴 | 2 |
| Add document tables | Backend | 🔴 | 2 |
| Generate Convex types | Backend | 🔴 | 3 |
| Create query functions | Backend | 🔴 | 3-4 |
| Create mutation functions | Backend | 🔴 | 4-5 |
| Review existing components | Web | 🔴 | 1 |
| Set up test environment | QA | 🔴 | 1-2 |
| Audit mobile features | Mobile | 🔴 | 1 |
| Audit UI primitives | UI | 🔴 | 1 |

---

## IMMEDIATE FILE REFERENCES

### Critical Files (Open Now)

```bash
# Backend Agent - Open these:
open packages/backend/convex/schema.ts
open packages/backend/convex/schema_additions.ts
open migrations/001_add_missing_tables.ts
open migrations/002_convex_functions_template.ts

# Web Agent - Open these:
open apps/app/src/components/haus/voice-copilot-modal.tsx
open apps/app/src/components/advanced-search-filters.tsx
open COMPONENT_INVENTORY.md

# Mobile Agent - Open these:
open apps/mobile/app/(tabs)/search.tsx
open apps/mobile/app/(tabs)/voice.tsx
open CROSS_PLATFORM_STRATEGY.md

# UI Agent - Open these:
open packages/ui/src/components/button.tsx
open packages/ui/src/theme/tokens.ts
open COMPONENT_INVENTORY.md

# QA Agent - Open these:
open TESTING_STRATEGY.md
open MIGRATION_STATUS.md
```

---

## QUICK COMMANDS

### Backend
```bash
# Start Convex dev
cd packages/backend && bun run dev

# Deploy to production
cd packages/backend && bun run deploy

# Generate types
cd packages/backend && bun run dev --once
```

### Web
```bash
# Start dev server
cd apps/app && bun dev

# Build for production
cd apps/app && bun run build

# Run tests
cd apps/app && bun test
```

### Mobile
```bash
# Start iOS
cd apps/mobile && bun dev:ios

# Start Android
cd apps/mobile && bun dev:android

# Run tests
cd apps/mobile && bun test
```

### Root
```bash
# Install all dependencies
bun install

# Run all tests
bun run test

# Build all apps
bun run build
```

---

## VERIFICATION CHECKPOINTS

### Day 1 End
- [ ] Backend Agent: Schema file opened, tables identified
- [ ] Web Agent: Dev server running, components reviewed
- [ ] Mobile Agent: Dev server running, screens reviewed
- [ ] UI Agent: UI package audited
- [ ] QA Agent: Test plan started

### Day 2 End
- [ ] Backend Agent: First 3 tables created
- [ ] Web Agent: First component migration started
- [ ] Mobile Agent: Missing features list complete
- [ ] UI Agent: Missing primitives list complete

### Day 3 End
- [ ] Backend Agent: All 9 tables created
- [ ] Backend Agent: Types generated
- [ ] Web Agent: 2 components migrated
- [ ] Mobile Agent: First screen PR ready

### Day 5 End (Week 1 Complete)
- [ ] Backend Agent: All query functions working
- [ ] Web Agent: 5 components migrated
- [ ] Mobile Agent: 2 screens complete
- [ ] QA Agent: Test infrastructure ready

---

## TROUBLESHOOTING

### Convex schema errors
```bash
# Regenerate types
cd packages/backend && rm -rf convex/_generated && bun run dev

# Check for syntax errors
bun run typecheck
```

### Web build errors
```bash
# Clear cache
rm -rf apps/app/.next apps/app/node_modules/.cache
bun dev
```

### Mobile build errors
```bash
# Clear all caches
cd apps/mobile
rm -rf node_modules .expo ios/Pods
bun install
cd ios && pod install && cd ..
bun dev:ios
```

### Package not found
```bash
# Reinstall all dependencies
rm -rf node_modules apps/*/node_modules packages/*/node_modules
bun install
```

---

## DAILY STANDUP TEMPLATE

Post in your channel every morning:

```markdown
## [Agent Name] - [Date]

### Yesterday
- ✅ Completed: [What you finished]
- 🔄 In Progress: [What you worked on]

### Today
- 🎯 Goal: [What you'll complete]
- 📋 Tasks: [Specific tasks]

### Blockers
- ⚠️ [Any blockers or none]

### Needs Help
- 🙋 [Anything you need from other agents]
```

---

## COMMUNICATION CHANNELS

### Update These Files Daily
1. **MIGRATION_STATUS.md** - Update progress percentages
2. **SPRINT_PLAN.md** - Mark completed stories
3. **Component inventory** - Mark migrated components

### When to Escalate
- Blocked >1 hour → Ask in general channel
- Blocked >3 hours → Escalate to leads
- Architecture decision needed → Schedule meeting
- Schema conflicts → Backend Agent coordinates

---

## SUCCESS CRITERIA (Week 1)

✅ All 9 database tables created  
✅ Convex types generated  
✅ Query functions implemented  
✅ Web dev environment running  
✅ Mobile dev environment running  
✅ First components migrated  
✅ Test infrastructure ready  

---

## MOTIVATION

> "The swarm executes as one."

Remember:
- Every file migrated brings us closer to the goal
- Quality over speed - do it right the first time
- Ask for help early and often
- Celebrate wins, learn from setbacks
- We're building something amazing together

---

## READY TO START?

1. Read `SWARM_QUICKSTART.md` (5 minutes)
2. Find your section in this document
3. Execute Day 1 tasks
4. Post your standup
5. **LET'S GO! 🚀**

---

*Questions? Check the full documentation package or ask the swarm.*

**The migration begins NOW.**
