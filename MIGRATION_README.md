# HAUS Migration Documentation

**Complete guide to the HAUS platform migration from single-app to Turborepo monorepo.**

---

## 📚 DOCUMENTATION INDEX

### Primary Documents

| Document | Purpose | Audience |
|----------|---------|----------|
| **[FULL_MIGRATION_PLAN.md](FULL_MIGRATION_PLAN.md)** | Master migration roadmap with phases, timelines, and detailed tasks | All agents, Project leads |
| **[MIGRATION_ANALYSIS.md](MIGRATION_ANALYSIS.md)** | Detailed feature-by-feature gap analysis between source and target | Backend Agent, Web Agent |
| **[MIGRATION_STATUS.md](MIGRATION_STATUS.md)** | Real-time progress tracking and status dashboard | All agents, Stakeholders |
| **[CROSS_PLATFORM_STRATEGY.md](CROSS_PLATFORM_STRATEGY.md)** | Web + Mobile development guidelines and patterns | Web Agent, Mobile Agent |
| **[IMPLEMENTATION_PLAYBOOKS.md](IMPLEMENTATION_PLAYBOOKS.md)** | Step-by-step execution guides for swarm agents | All agents |
| **[COMPONENT_INVENTORY.md](COMPONENT_INVENTORY.md)** | Complete inventory of 434 components to migrate | Web Agent, UI Agent |

### Quick Reference

| If you need to... | Read this document |
|-------------------|-------------------|
| Understand overall migration scope | [FULL_MIGRATION_PLAN.md](FULL_MIGRATION_PLAN.md) |
| Check current progress | [MIGRATION_STATUS.md](MIGRATION_STATUS.md) |
| Find specific component info | [COMPONENT_INVENTORY.md](COMPONENT_INVENTORY.md) |
| Implement a database feature | [IMPLEMENTATION_PLAYBOOKS.md](IMPLEMENTATION_PLAYBOOKS.md) # Playbook 1 |
| Build a web component | [IMPLEMENTATION_PLAYBOOKS.md](IMPLEMENTATION_PLAYBOOKS.md) # Playbook 3 |
| Build a mobile screen | [IMPLEMENTATION_PLAYBOOKS.md](IMPLEMENTATION_PLAYBOOKS.md) # Playbook 4 |
| Ensure Web/Mobile parity | [CROSS_PLATFORM_STRATEGY.md](CROSS_PLATFORM_STRATEGY.md) |
| Understand what's missing | [MIGRATION_ANALYSIS.md](MIGRATION_ANALYSIS.md) |

---

## 🎯 MIGRATION OVERVIEW

### Source Repository
- **Location:** `/Users/alias/Desktop/haus-voice-search`
- **Type:** Single Next.js application
- **Features:** 93 pages, 510 components, 31 API routes
- **Status:** Feature-complete, mature codebase

### Target Repository  
- **Location:** `/Users/alias/Desktop/haus-voice-search/_external/haus-turborepo-prod`
- **Type:** Turborepo monorepo (5 apps + 5 packages)
- **Features:** Foundation complete, needs feature migration
- **Status:** Active development, modern stack

### Migration Goal
Achieve **100% feature parity** across:
- ✅ Web application (`apps/app`)
- ✅ Mobile application (`apps/mobile`)  
- ✅ Shared backend (`packages/backend`)
- ✅ Marketing site (`apps/web`)

---

## 📊 KEY METRICS

### By the Numbers

| Metric | Source | Target (Current) | Target (Post-Migration) |
|--------|--------|------------------|------------------------|
| **Apps** | 1 | 5 | 5 |
| **Pages/Routes** | 93 | ~15 | 93+ |
| **Components** | 510 | ~50 | 510+ |
| **API Routes** | 31 | ~6 | 31+ |
| **Database Tables** | 23 | 20 | 23+ |
| **Hooks** | 19 | ~10 | 19+ |

### Migration Scope

- **Total Components to Migrate:** 434
- **Total New Pages:** ~60
- **Total New API Routes:** ~25
- **Total Database Tables to Add:** 9
- **Estimated Duration:** 20 weeks (5 months)

---

## 🗺️ MIGRATION PHASES

```
Phase 1: Foundation        [░░░░░░░░░░] 0%  Weeks 1-2
├── Database schema alignment
├── Convex functions
└── API routes

Phase 2: Core Property     [░░░░░░░░░░] 0%  Weeks 3-4
├── Compass map search
├── Advanced filters
└── Property details

Phase 3: AI & Voice        [░░░░░░░░░░] 0%  Weeks 5-6
├── Voice copilot
├── Cedar voice
└── AI elements

Phase 4: Marketplace       [░░░░░░░░░░] 0%  Weeks 7-8
├── Provider system
├── Categories
└── Quotes

Phase 5: Trust & Safety    [░░░░░░░░░░] 0%  Weeks 9-10
├── DUD reports
└── Watchdog

Phase 6: Academy           [░░░░░░░░░░] 0%  Weeks 11-12
├── Courses
├── Gamification
└── First home

Phase 7: User Features     [░░░░░░░░░░] 0%  Weeks 13-14
├── Dashboard
├── Messages
└── Rooms

Phase 8: Agent Tools       [░░░░░░░░░░] 0%  Weeks 15-16
├── Agent dashboard
└── Pipeline

Phase 9: Tools             [░░░░░░░░░░] 0%  Weeks 17-18
├── Calculators
└── Comparisons

Phase 10: Marketing        [░░░░░░░░░░] 0%  Weeks 19-20
└── Content pages
```

---

## 🎭 SWARM ROLES

### Agent Responsibilities

| Agent | Primary Files | Key Documents |
|-------|--------------|---------------|
| **Backend Agent** | `packages/backend/convex/*` | Playbook 1, Playbook 2 |
| **Web Agent** | `apps/app/src/**/*` | Playbook 3, Playbook 5 |
| **Mobile Agent** | `apps/mobile/**/*` | Playbook 4, Cross-Platform Strategy |
| **UI Agent** | `packages/ui/src/*` | Component Inventory |
| **QA Agent** | Tests across all apps | Playbook 6 |

---

## 🚀 QUICK START

### For Backend Agent

1. Read [IMPLEMENTATION_PLAYBOOKS.md](IMPLEMENTATION_PLAYBOOKS.md) # Playbook 1
2. Check [MIGRATION_ANALYSIS.md](MIGRATION_ANALYSIS.md) for database gaps
3. Start with schema changes in `packages/backend/convex/schema.ts`
4. Follow table creation order in [FULL_MIGRATION_PLAN.md](FULL_MIGRATION_PLAN.md)

### For Web Agent

1. Read [IMPLEMENTATION_PLAYBOOKS.md](IMPLEMENTATION_PLAYBOOKS.md) # Playbook 3
2. Review existing components in `apps/app/src/components/`
3. Check [COMPONENT_INVENTORY.md](COMPONENT_INVENTORY.md) for migration priority
4. Follow component migration template

### For Mobile Agent

1. Read [CROSS_PLATFORM_STRATEGY.md](CROSS_PLATFORM_STRATEGY.md)
2. Review existing screens in `apps/mobile/app/`
3. Check feature parity gaps in [MIGRATION_STATUS.md](MIGRATION_STATUS.md)
4. Follow mobile screen creation template

### For UI Agent

1. Review `packages/ui/src/components/`
2. Check [COMPONENT_INVENTORY.md](COMPONENT_INVENTORY.md) for UI primitives
3. Ensure design token consistency
4. Update shared components as needed

---

## 📋 DAILY WORKFLOW

### Morning Standup (15 min)
- Check [MIGRATION_STATUS.md](MIGRATION_STATUS.md)
- Report blockers
- Coordinate dependencies

### During Development
- Reference appropriate playbook
- Update status tracker
- Document decisions

### End of Day
- Update [MIGRATION_STATUS.md](MIGRATION_STATUS.md)
- Commit progress
- Hand off to next shift

---

## 🔗 CRITICAL PATHS

### Path 1: Property Search
```
Database Schema → Convex Functions → API Routes → 
Web Components → Mobile Screens → Testing
```

### Path 2: Voice AI
```
Database Schema → Convex Functions → API Routes → 
Web Components → Mobile Integration → Testing
```

### Path 3: Marketplace
```
Database Schema → Convex Functions → API Routes → 
Web Components → Mobile Screens → Testing
```

---

## ⚠️ CRITICAL DECISIONS

### Made
1. ✅ Use existing target schema as base
2. ✅ Migrate source data to target tables
3. ✅ Maintain feature parity across platforms
4. ✅ Share backend (Convex) across all apps

### Pending
- [ ] UI primitive consolidation strategy
- [ ] Animation library standardization
- [ ] Testing framework selection

---

## 📞 ESCALATION

### When to Escalate
- Schema conflicts between source and target
- Component dependency circular references
- Performance bottlenecks
- Timeline risks

### How to Escalate
1. Document issue in [MIGRATION_STATUS.md](MIGRATION_STATUS.md) Blockers section
2. Tag relevant agents
3. Schedule coordination meeting
4. Update migration plan if needed

---

## 🎓 RESOURCES

### Internal Documentation
- `AGENTS.md` - Project conventions and setup
- `README.md` - General project info
- `packages/backend/convex/README.md` - Backend conventions

### External Resources
- [Convex Docs](https://docs.convex.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [Expo Docs](https://docs.expo.dev)

---

## ✅ SUCCESS CRITERIA

Migration is complete when:

- [ ] All 434 components migrated or replaced
- [ ] All 93 page routes functional
- [ ] All 31 API routes operational
- [ ] Database schema aligned
- [ ] Feature parity between Web and Mobile
- [ ] Tests passing >80% coverage
- [ ] Documentation updated
- [ ] Performance benchmarks met

---

*This document is the entry point for all migration documentation.*

**Next Steps:**
1. Read [FULL_MIGRATION_PLAN.md](FULL_MIGRATION_PLAN.md) for the big picture
2. Check [MIGRATION_STATUS.md](MIGRATION_STATUS.md) for current progress
3. Follow your agent-specific playbook in [IMPLEMENTATION_PLAYBOOKS.md](IMPLEMENTATION_PLAYBOOKS.md)
