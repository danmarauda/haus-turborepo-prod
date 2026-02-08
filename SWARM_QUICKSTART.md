# HAUS Migration - Swarm Quickstart Guide

**Get started with migration in 5 minutes**

---

## 🎯 YOUR ROLE

### I am a... 

#### Backend Agent
**Focus:** Database schema, Convex functions, API routes  
**Start here:**
1. Read `migrations/001_add_missing_tables.ts`
2. Read `migrations/002_convex_functions_template.ts`
3. Copy table definitions to `packages/backend/convex/schema.ts`
4. Create function files in `packages/backend/convex/`

**Key files:**
- `packages/backend/convex/schema.ts`
- `packages/backend/convex/dudReports.ts` (create)
- `packages/backend/convex/providers.ts` (create)
- `packages/backend/convex/compassListings.ts` (create)

---

#### Web Agent
**Focus:** Next.js pages, React components, hooks  
**Start here:**
1. Read `COMPONENT_INVENTORY.md` - find components assigned to you
2. Read `migrations/TEMPLATES.md` - Web Component Template
3. Check existing components in `apps/app/src/components/`
4. Create missing components following template

**Key files:**
- `apps/app/src/components/[feature]/` (create)
- `apps/app/src/app/[locale]/[route]/page.tsx` (create)
- `apps/app/src/hooks/` (create/update)

---

#### Mobile Agent
**Focus:** Expo screens, React Native components  
**Start here:**
1. Read `CROSS_PLATFORM_STRATEGY.md`
2. Read `MIGRATION_STATUS.md` - Mobile Feature Parity Gaps
3. Read `migrations/TEMPLATES.md` - Mobile Component Template
4. Create screens in `apps/mobile/app/`

**Key files:**
- `apps/mobile/app/(tabs)/` (enhance)
- `apps/mobile/components/` (create)
- `apps/mobile/hooks/` (create)

---

#### UI Agent
**Focus:** Design tokens, shared components  
**Start here:**
1. Compare `components/ui/` (source) with `packages/ui/src/components/` (target)
2. Identify missing primitives
3. Add to `packages/ui/src/components/`
4. Update design tokens

**Key files:**
- `packages/ui/src/components/` (enhance)
- `packages/ui/src/theme/tokens.ts` (update)

---

#### QA Agent
**Focus:** Testing, verification, documentation  
**Start here:**
1. Read `migrations/SPRINT_PLAN.md` - Definition of Done
2. Create test plans for each sprint
3. Set up testing framework
4. Verify feature parity

---

## 🚀 FIRST 5 MINUTES

### Step 1: Verify Environment

```bash
# All agents: Verify project structure
ls /Users/alias/Desktop/haus-voice-search/_external/haus-turborepo-prod

# Should see:
# - apps/
# - packages/
# - migrations/
# - *.md files
```

### Step 2: Check Current Status

```bash
# Read the status tracker
cat MIGRATION_STATUS.md | head -100
```

### Step 3: Find Your Tasks

```bash
# Backend: Check database section
grep -A 20 "## DATABASE" MIGRATION_STATUS.md

# Web: Check component counts
grep -A 10 "### By Category" COMPONENT_INVENTORY.md

# Mobile: Check feature gaps
grep -A 30 "## MOBILE FEATURE PARITY GAPS" MIGRATION_STATUS.md
```

### Step 4: Start Work

```bash
# Backend Agent - Start schema migration
cd packages/backend
bun run dev

# Web Agent - Start dev server
cd apps/app
bun dev

# Mobile Agent - Start Expo
cd apps/mobile
bun dev:ios # or dev:android
```

---

## 📋 DAILY CHECKLIST

### Morning (5 min)
- [ ] Read updated `MIGRATION_STATUS.md`
- [ ] Check for blockers
- [ ] Update your progress
- [ ] Sync with other agents

### During Work
- [ ] Follow templates in `migrations/TEMPLATES.md`
- [ ] Update status as you complete items
- [ ] Document any decisions
- [ ] Ask for help if blocked >30 min

### End of Day (5 min)
- [ ] Update `MIGRATION_STATUS.md`
- [ ] Commit your changes
- [ ] Note any carryover
- [ ] Plan tomorrow

---

## 🔥 CRITICAL PATHS

### Path 1: Database First
```
Backend Agent: Schema → Tables → Functions → API Routes
                    ↓
Web Agent:      Components → Pages
                    ↓
Mobile Agent:   Screens → Native Features
                    ↓
QA Agent:       Tests → Verification
```

### Path 2: Parallel Work
```
Sprint 1:
├── Backend: Schema (Week 1)
├── Web:     Audit existing (Week 1)
├── Mobile:  Audit existing (Week 1)
└── UI:      Design tokens (Week 1)

Sprint 2:
├── Backend: API routes (Week 2)
├── Web:     Core property (Week 2-3)
├── Mobile:  Core property (Week 2-3)
└── QA:      Test planning (Week 2)
```

---

## 🆘 COMMON ISSUES

### Issue: Schema conflicts
**Solution:**
1. Check `MIGRATION_ANALYSIS.md` Table Comparison
2. Use target schema as base
3. Add missing fields from source
4. Run `bun run dev` to validate

### Issue: Component dependencies
**Solution:**
1. Use bottom-up approach
2. Migrate primitives first (Button, Input)
3. Then molecules (Card, Form)
4. Then organisms (FeatureComponent)

### Issue: Missing types
**Solution:**
```bash
cd packages/backend
bun run dev  # Regenerates types
```

### Issue: Build errors
**Solution:**
```bash
# Clean install
rm -rf node_modules apps/*/node_modules packages/*/node_modules
bun install

# Clear caches
rm -rf .turbo apps/*/.turbo packages/*/.turbo
rm -rf apps/app/.next
```

---

## 📞 ESCALATION

### When to escalate
- Blocked >1 hour
- Schema design questions
- Architecture decisions
- Timeline risks

### How to escalate
1. Document in `MIGRATION_STATUS.md` Blockers section
2. Tag relevant agents
3. Suggest solution options
4. Wait for response (max 30 min)

---

## ✅ DEFINITION OF DONE

### For each task:
- [ ] Code implemented
- [ ] Tests passing
- [ ] Types correct
- [ ] No console errors
- [ ] Mobile + Web (if applicable)
- [ ] Documentation updated
- [ ] Status tracker updated

---

## 📚 ESSENTIAL READING

### Must Read (Day 1)
1. `MIGRATION_README.md` - Overview
2. `FULL_MIGRATION_PLAN.md` - Roadmap
3. `MIGRATION_STATUS.md` - Current state
4. Your agent-specific playbook in `IMPLEMENTATION_PLAYBOOKS.md`

### Reference (As Needed)
- `COMPONENT_INVENTORY.md` - Component list
- `MIGRATION_ANALYSIS.md` - Gap analysis
- `CROSS_PLATFORM_STRATEGY.md` - Web/Mobile patterns
- `migrations/TEMPLATES.md` - Code templates
- `migrations/SPRINT_PLAN.md` - Sprint details

---

## 🎓 LEARNING RESOURCES

### Convex
- Docs: https://docs.convex.dev
- Key concepts: Queries, Mutations, Indexes

### Next.js
- Docs: https://nextjs.org/docs
- Key concepts: App Router, Server Components

### Expo
- Docs: https://docs.expo.dev
- Key concepts: Expo Router, Native Modules

---

## 🚦 STATUS INDICATORS

When updating `MIGRATION_STATUS.md`:

| Symbol | Meaning |
|--------|---------|
| 🔴 | Not Started |
| 🟡 | In Progress |
| 🟢 | Complete |
| ⚠️ | Blocked |

---

## 💡 PRO TIPS

### Backend Agent
- Use `npx convex dev` for live schema updates
- Test queries in Convex dashboard
- Add indexes early for performance

### Web Agent
- Use existing components as reference
- Check `@v1/ui` before creating new primitives
- Test responsive design at multiple breakpoints

### Mobile Agent
- Test on both iOS and Android
- Use Expo Go for quick iteration
- Handle platform differences gracefully

### UI Agent
- Maintain design token consistency
- Test components in both light/dark mode
- Document component usage

### QA Agent
- Automate regression tests
- Test edge cases
- Verify feature parity checklist

---

## 📊 SUCCESS METRICS

### We are winning when:
- All 9 new tables created ✅
- All 93 routes functional ✅
- All 434 components migrated ✅
- Tests passing >80% ✅
- Feature parity 100% ✅

---

**Ready? Let's migrate! 🚀**

*Questions? Check the full documentation or ask the swarm.*
