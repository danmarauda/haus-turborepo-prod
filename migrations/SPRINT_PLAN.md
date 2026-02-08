# HAUS Migration - Sprint Plans

**Format:** 2-week sprints  
**Team:** Multi-agent swarm  
**Goal:** Full feature parity

---

## SPRINT TEMPLATE

```markdown
## Sprint X: [Name]
**Dates:** Week X-Y  
**Goal:** [One-line objective]

### Capacity
- Backend Agent: [X] story points
- Web Agent: [X] story points
- Mobile Agent: [X] story points
- UI Agent: [X] story points
- QA Agent: [X] story points

### Stories

#### Story 1: [Name]
**Points:** X  
**Assignee:** [Agent]  
**Dependencies:** [List]

**Tasks:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

---

### Sprint Goals
- [ ] Goal 1
- [ ] Goal 2

### Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk] | [High/Med/Low] | [Action] |

### Definition of Done
- [ ] All stories complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Feature parity verified
```

---

## SPRINT 1: FOUNDATION - Database & Schema
**Dates:** Week 1-2  
**Goal:** Establish complete database schema for all missing tables

### Capacity
- Backend Agent: 20 points (100%)
- Web Agent: 0 points (on standby)
- Mobile Agent: 0 points (on standby)
- UI Agent: 5 points (design tokens)
- QA Agent: 5 points (test planning)

### Stories

#### Story 1.1: Create DUD Reports Table
**Points:** 3  
**Assignee:** Backend Agent  
**Dependencies:** None

**Tasks:**
- [ ] Create dudReports table definition
- [ ] Add indexes
- [ ] Create query functions (get, list, search)
- [ ] Create mutation functions (create, update)
- [ ] Write unit tests

**Acceptance Criteria:**
- [ ] Table exists in Convex dashboard
- [ ] Can CRUD records
- [ ] Indexes are queryable
- [ ] Tests pass

---

#### Story 1.2: Create Providers Table
**Points:** 3  
**Assignee:** Backend Agent  
**Dependencies:** None

**Tasks:**
- [ ] Create providers table definition
- [ ] Add indexes
- [ ] Create query functions
- [ ] Create mutation functions
- [ ] Write unit tests

**Acceptance Criteria:**
- [ ] Table exists in Convex dashboard
- [ ] Can CRUD records
- [ ] Indexes are queryable
- [ ] Tests pass

---

#### Story 1.3: Create Compass Listings Table
**Points:** 3  
**Assignee:** Backend Agent  
**Dependencies:** None

**Tasks:**
- [ ] Create compassListings table definition
- [ ] Add indexes
- [ ] Create spatial query functions
- [ ] Create seed function for sample data
- [ ] Write unit tests

**Acceptance Criteria:**
- [ ] Table exists in Convex dashboard
- [ ] Can query by bounds
- [ ] Can filter by property type, price, etc.
- [ ] Tests pass

---

#### Story 1.4: Create Gamification Tables
**Points:** 5  
**Assignee:** Backend Agent  
**Dependencies:** None

**Tasks:**
- [ ] Create userProgress table
- [ ] Create achievements table
- [ ] Create lessons table
- [ ] Create XP/leveling logic
- [ ] Create lesson completion tracking
- [ ] Write unit tests

**Acceptance Criteria:**
- [ ] All 3 tables exist
- [ ] XP progression works
- [ ] Lesson completion tracked
- [ ] Tests pass

---

#### Story 1.5: Create Document Management Tables
**Points:** 3  
**Assignee:** Backend Agent  
**Dependencies:** None

**Tasks:**
- [ ] Create tenders table
- [ ] Create tenderDocuments table
- [ ] Add file storage integration
- [ ] Create query/mutation functions
- [ ] Write unit tests

**Acceptance Criteria:**
- [ ] Both tables exist
- [ ] File upload works
- [ ] Documents linked to tenders
- [ ] Tests pass

---

#### Story 1.6: Update Design Tokens
**Points:** 3  
**Assignee:** UI Agent  
**Dependencies:** None

**Tasks:**
- [ ] Audit source design tokens
- [ ] Align with target tokens
- [ ] Update packages/ui tokens
- [ ] Document token usage

**Acceptance Criteria:**
- [ ] Tokens match source design
- [ ] Exported to all apps
- [ ] Documentation updated

---

### Sprint 1 Goals
- [ ] All 9 new tables created
- [ ] All indexes defined
- [ ] All query/mutation functions working
- [ ] Tests passing
- [ ] Schema documented

---

## SPRINT 2: FOUNDATION - API & Auth
**Dates:** Week 3-4  
**Goal:** Establish API routes and align auth systems

### Capacity
- Backend Agent: 15 points
- Web Agent: 10 points
- Mobile Agent: 5 points
- UI Agent: 5 points
- QA Agent: 5 points

### Stories

#### Story 2.1: Create API Routes
**Points:** 8  
**Assignee:** Backend Agent  
**Dependencies:** Sprint 1

**Tasks:**
- [ ] Create /api/agent route (Claude)
- [ ] Create /api/pica-voice-search route
- [ ] Create /api/cedar-voice route
- [ ] Create /api/copilot route
- [ ] Create /api/compass/listings route
- [ ] Create /api/market/providers route
- [ ] Create /api/dud/reports route
- [ ] Add rate limiting

**Acceptance Criteria:**
- [ ] All routes respond correctly
- [ ] Auth middleware working
- [ ] Rate limiting active
- [ ] Error handling implemented

---

#### Story 2.2: Align Auth Systems
**Points:** 5  
**Assignee:** Backend Agent + Web Agent  
**Dependencies:** None

**Tasks:**
- [ ] Review source auth implementation
- [ ] Test target @convex-dev/auth
- [ ] Identify gaps
- [ ] Implement missing features
- [ ] Migration script for user data

**Acceptance Criteria:**
- [ ] Users can login on both systems
- [ ] Sessions work correctly
- [ ] User data migrated
- [ ] No auth regressions

---

#### Story 2.3: Review Existing Web Components
**Points:** 5  
**Assignee:** Web Agent  
**Dependencies:** None

**Tasks:**
- [ ] Audit existing components in apps/app
- [ ] Compare with source components
- [ ] Identify gaps/enhancements needed
- [ ] Document findings
- [ ] Create migration tickets

**Acceptance Criteria:**
- [ ] Component audit complete
- [ ] Gap analysis documented
- [ ] Migration tickets created

---

#### Story 2.4: Mobile Feature Audit
**Points:** 3  
**Assignee:** Mobile Agent  
**Dependencies:** None

**Tasks:**
- [ ] Audit existing mobile features
- [ ] Compare with source features
- [ ] Identify missing features
- [ ] Document priority order
- [ ] Create implementation tickets

**Acceptance Criteria:**
- [ ] Feature audit complete
- [ ] Priority list documented
- [ ] Tickets created

---

### Sprint 2 Goals
- [ ] All API routes operational
- [ ] Auth system aligned
- [ ] Component audit complete
- [ ] Mobile feature audit complete

---

## SPRINT 3: CORE PROPERTY - Compass & Search
**Dates:** Week 5-6  
**Goal:** Implement map-based property search

### Capacity
- Backend Agent: 8 points
- Web Agent: 15 points
- Mobile Agent: 10 points
- UI Agent: 5 points
- QA Agent: 5 points

### Stories

#### Story 3.1: Compass Web Components
**Points:** 8  
**Assignee:** Web Agent  
**Dependencies:** Sprint 1

**Tasks:**
- [ ] Migrate compass-content.tsx
- [ ] Migrate compass-map-leaflet.tsx
- [ ] Migrate compass-map-view.tsx
- [ ] Migrate compass-listings-panel.tsx
- [ ] Integrate with Convex
- [ ] Add filters

**Acceptance Criteria:**
- [ ] Map displays correctly
- [ ] Listings show on map
- [ ] Filters work
- [ ] Mobile responsive

---

#### Story 3.2: Compass Page
**Points:** 3  
**Assignee:** Web Agent  
**Dependencies:** Story 3.1

**Tasks:**
- [ ] Create /compass page
- [ ] Layout components
- [ ] Integrate map
- [ ] Add search bar

**Acceptance Criteria:**
- [ ] Page loads at /compass
- [ ] Map fills viewport
- [ ] Search functional

---

#### Story 3.3: Compass Mobile Screen
**Points:** 8  
**Assignee:** Mobile Agent  
**Dependencies:** Sprint 1

**Tasks:**
- [ ] Create compass map screen
- [ ] Integrate with mobile map library
- [ ] Add property markers
- [ ] Add bottom sheet for listings
- [ ] Add filters modal

**Acceptance Criteria:**
- [ ] Map displays on mobile
- [ ] Markers tappable
- [ ] Bottom sheet works
- [ ] Filters functional

---

#### Story 3.4: Enhanced Search Filters
**Points:** 5  
**Assignee:** Web Agent  
**Dependencies:** None

**Tasks:**
- [ ] Review existing advanced-search-filters.tsx
- [ ] Add missing filters from source
- [ ] Update Convex queries
- [ ] Test filter combinations

**Acceptance Criteria:**
- [ ] All filters from source work
- [ ] Filter state persists
- [ ] URL params updated

---

### Sprint 3 Goals
- [ ] Compass map search on Web
- [ ] Compass map search on Mobile
- [ ] Enhanced filters working
- [ ] Tests passing

---

## SPRINT 4: CORE PROPERTY - Discovery & Details
**Dates:** Week 7-8  
**Goal:** Complete property discovery features

### Capacity
- Backend Agent: 5 points
- Web Agent: 15 points
- Mobile Agent: 10 points
- UI Agent: 5 points
- QA Agent: 5 points

### Stories

#### Story 4.1: Explore Page
**Points:** 5  
**Assignee:** Web Agent  
**Dependencies:** None

**Tasks:**
- [ ] Create explore page
- [ ] Migrate explore-content.tsx
- [ ] Add curated collections
- [ ] Add featured neighborhoods

**Acceptance Criteria:**
- [ ] Page at /explore
- [ ] Collections displayed
- [ ] Click through to search

---

#### Story 4.2: Suburb Profiles
**Points:** 5  
**Assignee:** Web Agent  
**Dependencies:** None

**Tasks:**
- [ ] Create suburb/[slug] page
- [ ] Display suburb stats
- [ ] Show recent sales
- [ ] Show market trends

**Acceptance Criteria:**
- [ ] Pages for each suburb
- [ ] Stats accurate
- [ ] Mobile responsive

---

#### Story 4.3: Property Detail Enhancements
**Points:** 5  
**Assignee:** Web Agent  
**Dependencies:** None

**Tasks:**
- [ ] Enhance property-detail-modal.tsx
- [ ] Add gallery
- [ ] Add similar properties
- [ ] Add virtual tour support

**Acceptance Criteria:**
- [ ] Gallery works
- [ ] Similar properties shown
- [ ] Virtual tour loads

---

#### Story 4.4: Mobile Property Enhancements
**Points:** 5  
**Assignee:** Mobile Agent  
**Dependencies:** None

**Tasks:**
- [ ] Enhance property/[id] screen
- [ ] Add image gallery
- [ ] Add property features
- [ ] Add agent contact

**Acceptance Criteria:**
- [ ] Gallery swipeable
- [ ] Features displayed
- [ ] Can contact agent

---

### Sprint 4 Goals
- [ ] Explore page live
- [ ] Suburb profiles working
- [ ] Property details enhanced
- [ ] Mobile property view improved

---

## SPRINTS 5-20: Continue Pattern...

See [FULL_MIGRATION_PLAN.md](FULL_MIGRATION_PLAN.md) for complete phase breakdown.

---

## VELOCITY TRACKING

| Sprint | Planned | Completed | Velocity |
|--------|---------|-----------|----------|
| 1 | 20 | TBD | TBD |
| 2 | 25 | TBD | TBD |
| 3 | 28 | TBD | TBD |
| 4 | 25 | TBD | TBD |

---

## DEFINITION OF DONE (All Sprints)

### For Backend Stories
- [ ] Schema updated
- [ ] Functions implemented
- [ ] Indexes optimized
- [ ] Unit tests passing
- [ ] API documented
- [ ] No breaking changes

### For Web Stories
- [ ] Component/page implemented
- [ ] Responsive design
- [ ] Accessibility checked
- [ ] Tests written
- [ ] Storybook story (if component)
- [ ] Documentation updated

### For Mobile Stories
- [ ] Screen implemented
- [ ] iOS tested
- [ ] Android tested
- [ ] Native features working
- [ ] Tests written
- [ ] Documentation updated

### For UI Stories
- [ ] Component implemented
- [ ] Design tokens updated
- [ ] Both platforms tested
- [ ] Documentation updated

### For QA Stories
- [ ] Test plan created
- [ ] Automated tests written
- [ ] Manual tests executed
- [ ] Bugs logged
- [ ] Regression tests passing

---

*Sprint plans are updated at the end of each sprint.*
