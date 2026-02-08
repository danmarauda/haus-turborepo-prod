# HAUS Component Inventory

**Complete inventory of components to migrate**  
**Date:** 2026-02-02

---

## SUMMARY

| Category | Count | Migrated | Pending |
|----------|-------|----------|---------|
| Voice/AI | 80 | 15 | 65 |
| Property/Search | 90 | 25 | 65 |
| Marketplace | 14 | 7 | 7 |
| Trust/Safety | 35 | 0 | 35 |
| Academy | 15 | 0 | 15 |
| User/Dashboard | 70 | 10 | 60 |
| Navigation | 20 | 8 | 12 |
| UI Primitives | 110 | 25 | 85 |
| **TOTAL** | **434** | **90** | **344** |

---

## 1. VOICE & AI COMPONENTS (80)

### 1.1 Core Voice (24)

| Component | Source Path | Target Path | Priority | Size | Status |
|-----------|-------------|-------------|----------|------|--------|
| elevenlabs-voice-system.tsx | components/voice/ | apps/app/components/voice/ | HIGH | 17KB | ❌ |
| voice-copilot-root.tsx | components/voice/ | apps/app/components/voice/ | HIGH | 1KB | ❌ |
| voice-copilot-widget.tsx | components/voice/ | apps/app/components/voice/ | HIGH | 9KB | ❌ |
| voice-copilot-provider.tsx | components/voice/ | apps/app/components/voice/ | HIGH | 9KB | ❌ |
| voice-navigation-orb.tsx | components/voice/ | apps/app/components/voice/ | HIGH | 9KB | ❌ |
| voice-navigation-overlay.tsx | components/voice/ | apps/app/components/voice/ | MEDIUM | 3KB | ❌ |
| voice-navigation-help.tsx | components/voice/ | apps/app/components/voice/ | MEDIUM | 5KB | ❌ |
| voice-fullscreen.tsx | components/voice/ | apps/app/components/voice/ | LOW | 1KB | ❌ |
| voice-sheet.tsx | components/voice/ | apps/app/components/voice/ | LOW | 1KB | ❌ |
| voice-waveform.tsx | components/voice/ | apps/app/components/voice/ | MEDIUM | 2KB | ❌ |
| voice-status-indicator.tsx | components/voice/ | apps/app/components/voice/ | LOW | 2KB | ❌ |
| voice-commands-help.tsx | components/voice/ | apps/app/components/voice/ | LOW | 11KB | ❌ |
| floating-orb.tsx | components/voice/ | apps/app/components/voice/ | LOW | 1KB | ❌ |
| keyboard-shortcut-listener.tsx | components/voice/ | apps/app/components/voice/ | MEDIUM | 1KB | ❌ |
| voice-copilot.tsx | components/ | Review existing | CRITICAL | 43KB | 🔄 |
| voice-copilot-unified.tsx | components/ | Review existing | CRITICAL | 38KB | 🔄 |
| voice-copilot-modal.tsx | components/ | Review existing | CRITICAL | 26KB | 🔄 |
| voice-orb.tsx | components/ | Review existing | HIGH | 6KB | 🔄 |
| ai-voice-interface.tsx | components/ | Review existing | HIGH | 8KB | 🔄 |
| enhanced-voice-copilot.tsx | components/ | apps/app/components/ | MEDIUM | 16KB | ❌ |
| livekit-voice-bar.tsx | components/ | apps/app/components/ | MEDIUM | - | ❌ |
| livekit-floating-bar.tsx | components/ | apps/app/components/ | MEDIUM | - | ❌ |
| haus-scribe-interface.tsx | components/ | apps/app/components/ | MEDIUM | - | ❌ |
| AudioWaveform.tsx | components/ | apps/app/components/ | LOW | 8KB | ❌ |

### 1.2 AI Elements (19)

| Component | Source Path | Target Path | Priority | Status |
|-----------|-------------|-------------|----------|--------|
| code-block.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | MEDIUM | ❌ |
| conversation.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | MEDIUM | ❌ |
| message.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | MEDIUM | ❌ |
| prompt-input.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | MEDIUM | ❌ |
| model-selector.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | LOW | ❌ |
| reasoning.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | MEDIUM | ❌ |
| sources.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | MEDIUM | ❌ |
| tool.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | MEDIUM | ❌ |
| web-preview.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | LOW | ❌ |
| inline-citation.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | LOW | ❌ |
| panel.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | MEDIUM | ❌ |
| node.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | LOW | ❌ |
| edge.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | LOW | ❌ |
| loader.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | MEDIUM | ❌ |
| shimmer.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | LOW | ❌ |
| queue.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | LOW | ❌ |
| controls.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | MEDIUM | ❌ |
| confirmation.tsx | components/ai-elements/ | apps/app/components/ai-elements/ | LOW | ❌ |

### 1.3 Cedar Voice (8)

| Component | Source Path | Target Path | Priority | Status |
|-----------|-------------|-------------|----------|--------|
| cedar-voice-orb.tsx | components/cedar/ | apps/app/components/cedar/ | MEDIUM | ❌ |
| cedar-voice-context.tsx | components/cedar/ | apps/app/components/cedar/ | MEDIUM | ❌ |
| cedar-voice-fallback.tsx | components/cedar/ | apps/app/components/cedar/ | LOW | ❌ |
| cedar-results-panel.tsx | components/cedar/ | apps/app/components/cedar/ | MEDIUM | ❌ |
| cedar-copilot-actions.tsx | components/cedar-ui/ | apps/app/components/cedar/ | MEDIUM | ❌ |
| cedar-chat-input.tsx | components/cedar-ui/ | apps/app/components/cedar/ | MEDIUM | ❌ |
| chat-bubbles.tsx | components/cedar-ui/ | apps/app/components/cedar/ | LOW | ❌ |
| floating-cedar-chat.tsx | components/cedar-ui/ | apps/app/components/cedar/ | LOW | ❌ |

### 1.4 Ara System (3)

| Component | Source Path | Target Path | Priority | Status |
|-----------|-------------|-------------|----------|--------|
| ara-chat.tsx | components/ | apps/app/components/ | MEDIUM | ❌ |
| ara-orb.tsx | components/ | apps/app/components/ | MEDIUM | ❌ |
| ara-provider.tsx | components/ | apps/app/components/ | MEDIUM | ❌ |

### 1.5 LiveKit Agent UI (10)

| Component | Source Path | Target Path | Priority | Status |
|-----------|-------------|-------------|----------|--------|
| agent-session-provider.tsx | components/agents-ui/ | apps/app/components/agents-ui/ | HIGH | ❌ |
| agent-control-bar.tsx | components/agents-ui/ | apps/app/components/agents-ui/ | HIGH | ❌ |
| agent-audio-visualizer-bar.tsx | components/agents-ui/ | apps/app/components/agents-ui/ | MEDIUM | ❌ |
| agent-audio-visualizer-grid.tsx | components/agents-ui/ | apps/app/components/agents-ui/ | MEDIUM | ❌ |
| agent-chat-indicator.tsx | components/agents-ui/ | apps/app/components/agents-ui/ | LOW | ❌ |
| agent-chat-transcript.tsx | components/agents-ui/ | apps/app/components/agents-ui/ | MEDIUM | ❌ |
| agent-disconnect-button.tsx | components/agents-ui/ | apps/app/components/agents-ui/ | LOW | ❌ |
| agent-track-control.tsx | components/agents-ui/ | apps/app/components/agents-ui/ | MEDIUM | ❌ |
| agent-track-toggle.tsx | components/agents-ui/ | apps/app/components/agents-ui/ | MEDIUM | ❌ |
| start-audio-button.tsx | components/agents-ui/ | apps/app/components/agents-ui/ | LOW | ❌ |

### 1.6 Voice Chat (5)

| Component | Source Path | Target Path | Priority | Status |
|-----------|-------------|-------------|----------|--------|
| voice-chat-context.tsx | components/voice-chat/ | apps/app/components/voice-chat/ | MEDIUM | ❌ |
| voice-chat-drawer.tsx | components/voice-chat/ | apps/app/components/voice-chat/ | MEDIUM | ❌ |
| voice-chat-fab.tsx | components/voice-chat/ | apps/app/components/voice-chat/ | MEDIUM | ❌ |
| voice-chat-messages.tsx | components/voice-chat/ | apps/app/components/voice-chat/ | MEDIUM | ❌ |
| voice-chat-orb.tsx | components/voice-chat/ | apps/app/components/voice-chat/ | MEDIUM | ❌ |

### 1.7 Voice UI Variations (3)

| Component | Source Path | Target Path | Priority | Status |
|-----------|-------------|-------------|----------|--------|
| variation-1-orb.tsx | components/voice-ui/ | apps/app/components/voice-ui/ | LOW | ❌ |
| variation-2-sheet.tsx | components/voice-ui/ | apps/app/components/voice-ui/ | LOW | ❌ |
| variation-3-fullscreen.tsx | components/voice-ui/ | apps/app/components/voice-ui/ | LOW | ❌ |

---

## 2. PROPERTY & SEARCH COMPONENTS (90)

### 2.1 Core Search (14)

| Component | Source Path | Target Path | Priority | Size | Status |
|-----------|-------------|-------------|----------|------|--------|
| advanced-search-filters.tsx | components/ | Review existing | CRITICAL | 13KB | 🔄 |
| search-content.tsx | components/search/ | Review existing | CRITICAL | 28KB | 🔄 |
| property-results.tsx | components/ | Review existing | CRITICAL | 9KB | 🔄 |
| property-card.tsx | components/ | Review existing | CRITICAL | 6KB | 🔄 |
| property-detail-modal.tsx | components/ | Review existing | CRITICAL | 24KB | 🔄 |
| featured-listings.tsx | components/ | Review existing | HIGH | - | 🔄 |
| compass-content.tsx | components/compass/ | apps/app/components/compass/ | CRITICAL | 36KB | ❌ |
| compass-content-v2.tsx | components/compass/ | apps/app/components/compass/ | LOW | 2KB | ❌ |
| compass-content-v3.tsx | components/compass/ | apps/app/components/compass/ | LOW | 2KB | ❌ |
| compass-content-haus.tsx | components/compass/ | apps/app/components/compass/ | MEDIUM | 1KB | ❌ |
| compass-map-leaflet.tsx | components/compass/ | apps/app/components/compass/ | HIGH | 5KB | ❌ |
| compass-map-view.tsx | components/compass/ | apps/app/components/compass/ | HIGH | 13KB | ❌ |
| compass-map-controls.tsx | components/compass/ | apps/app/components/compass/ | MEDIUM | 7KB | ❌ |
| compass-sidebar.tsx | components/compass/ | apps/app/components/compass/ | MEDIUM | 15KB | ❌ |

### 2.2 Property Display (13)

| Component | Source Path | Target Path | Priority | Status |
|-----------|-------------|-------------|----------|--------|
| property-detail-content.tsx | components/property/ | apps/app/components/property/ | HIGH | ❌ |
| property-gallery.tsx | components/property/ | apps/app/components/property/ | MEDIUM | ❌ |
| property-features.tsx | components/property/ | apps/app/components/property/ | MEDIUM | ❌ |
| property-specs.tsx | components/property/ | apps/app/components/property/ | MEDIUM | ❌ |
| luxury-property-detail.tsx | components/property/ | apps/app/components/property/ | LOW | ❌ |
| search-filters.tsx | components/property/ | apps/app/components/property/ | MEDIUM | ❌ |
| virtual-tour.tsx | components/property/ | apps/app/components/property/ | LOW | ❌ |
| similar-properties.tsx | components/property/ | apps/app/components/property/ | MEDIUM | ❌ |
| agent-card.tsx | components/property/ | apps/app/components/property/ | MEDIUM | ❌ |
| price-card.tsx | components/property/ | apps/app/components/property/ | MEDIUM | ❌ |
| haus-intelligence.tsx | components/property/ | apps/app/components/property/ | MEDIUM | ❌ |
| theme-toggle.tsx | components/property/ | apps/app/components/property/ | LOW | ❌ |
| empty-state.tsx | components/ | apps/app/components/ | LOW | ❌ |

### 2.3 Listing Components (19)

| Component | Source Path | Target Path | Priority | Status |
|-----------|-------------|-------------|----------|--------|
| listing-hero.tsx | components/listing/ | apps/app/components/listing/ | MEDIUM | ❌ |
| listing-hero-enhanced.tsx | components/listing/ | apps/app/components/listing/ | LOW | ❌ |
| property-dna.tsx | components/listing/ | apps/app/components/listing/ | MEDIUM | ❌ |
| neighborhood-insights.tsx | components/listing/ | apps/app/components/listing/ | MEDIUM | ❌ |
| location-section.tsx | components/listing/ | apps/app/components/listing/ | MEDIUM | ❌ |
| agent-sidebar.tsx | components/listing/ | apps/app/components/listing/ | MEDIUM | ❌ |
| concierge-services.tsx | components/listing/ | apps/app/components/listing/ | LOW | ❌ |
| property-overview.tsx | components/listing/ | apps/app/components/listing/ | MEDIUM | ❌ |
| listing-header.tsx | components/listing/ | apps/app/components/listing/ | MEDIUM | ❌ |
| listing-footer.tsx | components/listing/ | apps/app/components/listing/ | MEDIUM | ❌ |

### 2.4 Compass Extended (11)

| Component | Source Path | Target Path | Priority | Status |
|-----------|-------------|-------------|----------|--------|
| compass-listings-panel.tsx | components/compass/ | apps/app/components/compass/ | HIGH | ❌ |
| compass-listings-sidebar.tsx | components/compass/ | apps/app/components/compass/ | HIGH | ❌ |
| compass-floating-navbar.tsx | components/compass/ | apps/app/components/compass/ | MEDIUM | ❌ |
| haus-command-deck.tsx | components/compass/ | apps/app/components/compass/ | MEDIUM | ❌ |
| haus-property-sidebar.tsx | components/compass/ | apps/app/components/compass/ | MEDIUM | ❌ |

---

## 3. MARKETPLACE COMPONENTS (14)

| Component | Source Path | Target Path | Priority | Size | Status |
|-----------|-------------|-------------|----------|------|--------|
| market-content.tsx | components/market/ | Review existing | HIGH | 42KB | 🔄 |
| marketplace-content.tsx | components/market/ | Review existing | HIGH | 33KB | 🔄 |
| category-content.tsx | components/market/ | apps/app/components/market/ | HIGH | 38KB | ❌ |
| provider-profile-content.tsx | components/market/ | apps/app/components/market/ | HIGH | 40KB | ❌ |
| provider-dashboard-content.tsx | components/market/ | apps/app/components/market/ | MEDIUM | 57KB | ❌ |
| provider-join-content.tsx | components/market/ | apps/app/components/market/ | MEDIUM | 27KB | ❌ |
| quote-request-content.tsx | components/market/ | apps/app/components/market/ | MEDIUM | 34KB | ❌ |

---

## 4. TRUST & SAFETY COMPONENTS (35)

### 4.1 Trust (5)

| Component | Source Path | Target Path | Priority | Size | Status |
|-----------|-------------|-------------|----------|------|--------|
| dud-content.tsx | components/trust/ | apps/app/components/trust/ | MEDIUM | 19KB | ❌ |
| dud-content-convex.tsx | components/trust/ | apps/app/components/trust/ | MEDIUM | 28KB | ❌ |
| dud-content-static.tsx | components/trust/ | apps/app/components/trust/ | LOW | 6KB | ❌ |
| dud-content-wrapper.tsx | components/trust/ | apps/app/components/trust/ | LOW | 1KB | ❌ |
| dud-report-content.tsx | components/trust/ | apps/app/components/trust/ | MEDIUM | 21KB | ❌ |

### 4.2 Watchdog (28)

| Component | Source Path | Target Path | Priority | Status |
|-----------|-------------|-------------|----------|--------|
| watchdog-content.tsx | components/watchdog/ | apps/app/components/watchdog/ | MEDIUM | ❌ |
| atoms/* (5 files) | components/watchdog/atoms/ | apps/app/components/watchdog/ | LOW | ❌ |
| molecules/* (7 files) | components/watchdog/molecules/ | apps/app/components/watchdog/ | LOW | ❌ |
| organisms/* (15 files) | components/watchdog/organisms/ | apps/app/components/watchdog/ | MEDIUM | ❌ |

---

## 5. ACADEMY COMPONENTS (15)

| Component | Source Path | Target Path | Priority | Size | Status |
|-----------|-------------|-------------|----------|------|--------|
| academy-content.tsx | components/academy/ | apps/app/components/academy/ | MEDIUM | 17KB | ❌ |
| lesson-content.tsx | components/academy/ | apps/app/components/academy/ | MEDIUM | 13KB | ❌ |
| progress-content.tsx | components/academy/ | apps/app/components/academy/ | MEDIUM | 11KB | ❌ |
| region-selector-content.tsx | components/academy/ | apps/app/components/academy/ | LOW | 10KB | ❌ |
| contract-intelligence.tsx | components/first-home/ | apps/app/components/first-home/ | MEDIUM | ❌ |
| document-sidebar.tsx | components/first-home/ | apps/app/components/first-home/ | MEDIUM | ❌ |
| document-table.tsx | components/first-home/ | apps/app/components/first-home/ | MEDIUM | ❌ |
| ingestion-engine.tsx | components/first-home/ | apps/app/components/first-home/ | MEDIUM | ❌ |
| first-home-dashboard-content.tsx | components/first-home/ | apps/app/components/first-home/ | MEDIUM | ❌ |
| dashboard-nav.tsx | components/first-home/ | apps/app/components/first-home/ | LOW | ❌ |

**Note:** Academy already exists in Mobile (`apps/mobile/components/academy/`)

---

## 6. USER & DASHBOARD COMPONENTS (70)

### 6.1 Dashboard (10)

| Component | Source Path | Target Path | Priority | Size | Status |
|-----------|-------------|-------------|----------|------|--------|
| dashboard-content.tsx | components/dashboard/ | apps/app/components/dashboard/ | MEDIUM | 9KB | ❌ |
| action-card.tsx | components/dashboard/ | apps/app/components/dashboard/ | MEDIUM | ❌ |
| chart-widget.tsx | components/dashboard/ | apps/app/components/dashboard/ | MEDIUM | ❌ |
| metric-widget.tsx | components/dashboard/ | apps/app/components/dashboard/ | MEDIUM | ❌ |
| glass-panel.tsx | components/dashboard/ | apps/app/components/dashboard/ | LOW | ❌ |
| file-row.tsx | components/dashboard/ | apps/app/components/dashboard/ | LOW | ❌ |
| folder-card.tsx | components/dashboard/ | apps/app/components/dashboard/ | LOW | ❌ |
| progress-bar.tsx | components/dashboard/ | apps/app/components/dashboard/ | LOW | ❌ |
| progress-ring.tsx | components/dashboard/ | apps/app/components/dashboard/ | LOW | ❌ |
| step-indicator.tsx | components/dashboard/ | apps/app/components/dashboard/ | LOW | ❌ |

### 6.2 Messages (1)

| Component | Source Path | Target Path | Priority | Status |
|-----------|-------------|-------------|----------|--------|
| messages-content.tsx | components/messages/ | apps/app/components/messages/ | MEDIUM | ❌ |

### 6.3 Rooms (1)

| Component | Source Path | Target Path | Priority | Status |
|-----------|-------------|-------------|----------|--------|
| rooms-content.tsx | components/rooms/ | apps/app/components/rooms/ | MEDIUM | ❌ |

### 6.4 Vault/Documents (varies)

| Component | Source Path | Target Path | Priority | Status |
|-----------|-------------|-------------|----------|--------|
| vault-content.tsx | components/vault/ | apps/app/components/vault/ | MEDIUM | ❌ |
| upload-content.tsx | components/upload/ | apps/app/components/upload/ | MEDIUM | ❌ |
| documents-manager.tsx | components/documents/ | apps/app/components/documents/ | MEDIUM | ❌ |

**Note:** Vault exists in Mobile (`apps/mobile/components/vault/`)

### 6.5 Other User Components

| Component | Source Path | Target Path | Priority | Status |
|-----------|-------------|-------------|----------|--------|
| saved-properties.tsx | components/ | apps/app/components/ | HIGH | ❌ |
| settings-content.tsx | components/settings/ | apps/app/components/settings/ | MEDIUM | ❌ |
| profile-content.tsx | components/profile/ | apps/app/components/profile/ | MEDIUM | ❌ |
| progress-content.tsx | components/progress/ | apps/app/components/progress/ | LOW | ❌ |
| deal-team-content.tsx | components/deal-team/ | apps/app/components/deal-team/ | LOW | ❌ |

---

## 7. NAVIGATION COMPONENTS (20)

| Component | Source Path | Target Path | Priority | Size | Status |
|-----------|-------------|-------------|----------|------|--------|
| haus-nav.tsx | components/ | Review existing | HIGH | 30KB | 🔄 |
| haus-ai-navbar.tsx | components/ | apps/app/components/ | MEDIUM | 26KB | ❌ |
| haus-menu.tsx | components/ | apps/app/components/ | MEDIUM | 9KB | ❌ |
| global-floating-nav.tsx | components/ | apps/app/components/ | LOW | 2KB | ❌ |
| floating-ai-nav.tsx | components/ | apps/app/components/ | LOW | 36KB | ❌ |
| scroll-aware-navigation.tsx | components/ | apps/app/components/ | LOW | - | ❌ |
| universal-bottom-nav.tsx | components/ | apps/app/components/ | LOW | - | ❌ |
| header.tsx | components/ | Review existing | MEDIUM | - | 🔄 |
| hero-section.tsx | components/ | apps/app/components/ | MEDIUM | - | ❌ |
| ham-menu-icon.tsx | components/ | apps/app/components/ | LOW | - | ❌ |
| haus-logo*.tsx (3 files) | components/ | apps/app/components/ | LOW | - | ❌ |
| estate-logo.tsx | components/ | apps/app/components/ | LOW | - | ❌ |

---

## 8. UI SYSTEM COMPONENTS (110)

### 8.1 Base UI (34)

| Component | Source Path | Target Path | Priority | Status |
|-----------|-------------|-------------|----------|--------|
| button.tsx | components/ui/ | packages/ui/src/ | CRITICAL | 🔄 |
| card.tsx | components/ui/ | packages/ui/src/ | CRITICAL | 🔄 |
| dialog.tsx | components/ui/ | packages/ui/src/ | CRITICAL | 🔄 |
| sheet.tsx | components/ui/ | packages/ui/src/ | CRITICAL | 🔄 |
| input.tsx | components/ui/ | packages/ui/src/ | CRITICAL | 🔄 |
| select.tsx | components/ui/ | packages/ui/src/ | CRITICAL | 🔄 |
| All other 28 UI components | components/ui/ | packages/ui/src/ | HIGH | 🔄 |

### 8.2 Skiper UI (59)

**Status:** Migrate selectively based on usage

| Category | Count | Priority |
|----------|-------|----------|
| accordions | 5 | LOW |
| animations | 6 | MEDIUM |
| cards | 5 | MEDIUM |
| carousel | 5 | MEDIUM |
| chats | 5 | MEDIUM |
| controls | 12 | LOW |
| effects | 7 | LOW |
| forms | 5 | MEDIUM |
| galleries | 5 | LOW |
| grids | 9 | LOW |
| layouts | 5 | LOW |
| micro-interactions | 5 | MEDIUM |
| modals | 6 | MEDIUM |
| navigation | 5 | MEDIUM |
| overlays | 5 | LOW |
| preloaders | 12 | LOW |
| scroll-effects | 6 | MEDIUM |
| showcase | 5 | LOW |
| text-effects | 10 | LOW |
| timelines | 7 | LOW |
| tooltips | 6 | LOW |

### 8.3 Atomic Design (56)

**Status:** Review and migrate selectively

| Level | Count | Priority |
|-------|-------|----------|
| atoms | 22 | MEDIUM |
| molecules | 4 | LOW |
| organisms | 16 | MEDIUM |
| templates | 14 | LOW |

---

## MIGRATION TRACKING TEMPLATE

```markdown
### Component: [Name]

**Source:** `components/[path]/[name].tsx`
**Target:** `apps/app/src/components/[path]/[name].tsx`
**Priority:** [CRITICAL/HIGH/MEDIUM/LOW]
**Size:** [X KB]
**Status:** [❌/🔄/✅]

#### Migration Notes
- Dependencies: [List]
- Adaptations needed: [List]
- Mobile equivalent: [Yes/No/NA]

#### Checklist
- [ ] Code migrated
- [ ] Imports updated
- [ ] Types fixed
- [ ] Tests written
- [ ] Storybook story
- [ ] Documentation
```

---

*End of Component Inventory*
