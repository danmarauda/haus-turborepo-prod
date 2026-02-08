---
name: indexed-skills-reference
description: Reference to all skills indexed in Nia for this project. Use to find and access official Expo, Vercel, and other skills via semantic search.
---

# Indexed Skills Reference

This project has access to extensive skills indexed in Nia's permanent memory. Use Nia MCP tools to search and retrieve them.

## How to Search Skills

```typescript
// Search by topic
mcp__nia__context({ 
  action: "search", 
  query: "expo navigation tabs" 
})

// Search with tags
mcp__nia__context({ 
  action: "search", 
  tags: ["expo", "official"] 
})

// Semantic search
mcp__nia__context({ 
  action: "semantic-search", 
  query: "How to deploy Expo app to App Store" 
})
```

## Available Official Skills

### Expo Skills (expo/skills)

| Skill | ID | Description |
|-------|-----|-------------|
| Building Native UI | `d59bc159-...` | Route structure, navigation, styling, iOS controls |
| Native Data Fetching | `e776fedc-...` | Fetch, React Query, auth, offline, env vars |
| API Routes | `1d26c038-...` | Server-side routes, EAS Hosting, Cloudflare |
| Dev Client | `74685877-...` | Custom builds, TestFlight, local dev |
| Tailwind Setup | `8fb39507-...` | Tailwind v4, NativeWind v5 |
| DOM Components | `d729d80c-...` | Web code in webview |
| Deployment | `895e29f3-...` | App Store, Play Store, EAS Build |
| CI/CD Workflows | `0d016eee-...` | EAS Workflows automation |
| SDK Upgrading | `e9f9631c-...` | SDK upgrades, migrations |

### Vercel Skills (vercel-labs/agent-skills)

| Skill | ID | Description |
|-------|-----|-------------|
| React Best Practices | `0c4d7bb0-...` | 57 performance rules from Vercel Engineering |
| Web Design Guidelines | `6ccb3dd0-...` | 100+ UI/UX/accessibility rules |
| Deploy Claimable | `6f1c2ddc-...` | Instant deployments with claim URLs |

### Custom Vercel Skills

| Skill | ID | Description |
|-------|-----|-------------|
| AI SDK + Cortex | `2fd00633-...` | AI SDK 6, Cortex Memory integration |
| Auto-Deploy | `43a7097d-...` | Doppler secrets, browser automation |
| Convex Integration | `8e0e8624-...` | Full-stack Vercel/Convex patterns |
| Marketplace Integration | `6d9bcf77-...` | Webhook handlers, 1Password auth |
| Marketplace Setup | `20b70944-...` | 100+ integration slugs |
| Project Deployer | `98c6b4ed-...` | GitLab CI/CD, multi-environment |

## Indexed Documentation

### Convex Docs
- https://docs.convex.dev (indexed)
- https://labs.convex.dev/better-auth (indexed)

### Vercel Docs
- https://sdk.vercel.ai/docs (indexed)
- https://vercel.com/docs (indexed)

### Expo Docs
- https://docs.expo.dev (indexed)

## Quick Access Commands

```bash
# List all Convex resources
mcp__nia__manage_resource({ action: "list", query: "convex" })

# Search Convex docs
mcp__nia__search({ 
  query: "Convex mutations and queries", 
  data_sources: ["docs.convex.dev"] 
})

# Read specific Convex doc
mcp__nia__doc_read({ 
  source_identifier: "docs.convex.dev", 
  path: "/api/auth.md" 
})

# Deep research
mcp__nia__nia_deep_research_agent({ 
  query: "Best practices for Expo + Convex realtime applications" 
})
```

## Repositories Indexed

- `expo/skills` - Official Expo skills
- `vercel-labs/agent-skills` - Official Vercel skills
- `vercel/ai` - AI SDK source
- `get-convex/convex-auth` - Convex Auth
- Multiple Expo/Convex templates

## When to Use This Reference

1. **Need official guidance** - Search indexed skills first
2. **Implementation patterns** - Find working examples
3. **Troubleshooting** - Search for known issues
4. **Upgrading** - Check SDK migration guides
5. **Best practices** - Access curated patterns
