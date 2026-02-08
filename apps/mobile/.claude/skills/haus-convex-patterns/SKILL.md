---
name: haus-convex-patterns
description: HAUS Platform Convex database patterns for realtime data, queries, mutations, and schema. Use when working with Convex database, adding tables, or implementing realtime features.
---

# HAUS Convex Patterns

## Project Setup

### Files
- `convex/schema.ts` - Database schema definitions
- `convex/*.ts` - Query and mutation files
- `lib/convex.ts` - Client setup

### Commands
```bash
bun convex dev      # Start Convex dev server
bun convex deploy   # Deploy to production
```

## Schema Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  properties: defineTable({
    title: v.string(),
    address: v.string(),
    price: v.number(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.union(v.literal('house'), v.literal('apartment'), v.literal('townhouse')),
    status: v.union(v.literal('active'), v.literal('pending'), v.literal('sold')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_type', ['type'])
    .index('by_price', ['price']),
    
  rooms: defineTable({
    name: v.string(),
    propertyId: v.id('properties'),
    hostUserId: v.string(),
    participants: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_property', ['propertyId'])
    .index('by_host', ['hostUserId']),
    
  uploads: defineTable({
    userId: v.string(),
    fileUrl: v.string(),
    fileType: v.string(),
    analysisResult: v.optional(v.any()),
    status: v.union(v.literal('pending'), v.literal('analyzing'), v.literal('complete'), v.literal('error')),
    createdAt: v.number(),
  })
    .index('by_user', ['userId']),
});
```

## Queries

```typescript
// convex/properties.ts
import { query } from './_generated/server';
import { v } from 'convex/values';

// List all properties
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('properties').collect();
  },
});

// Get by ID
export const getById = query({
  args: { id: v.id('properties') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Filter with index
export const byStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('properties')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .collect();
  },
});

// Complex query with multiple filters
export const search = query({
  args: {
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('properties');
    
    // Filter in memory for complex queries
    const all = await query.collect();
    
    return all
      .filter(p => !args.minPrice || p.price >= args.minPrice)
      .filter(p => !args.maxPrice || p.price <= args.maxPrice)
      .filter(p => !args.type || p.type === args.type)
      .slice(0, args.limit ?? 50);
  },
});
```

## Mutations

```typescript
// convex/properties.ts
import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: {
    title: v.string(),
    address: v.string(),
    price: v.number(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    type: v.union(v.literal('house'), v.literal('apartment'), v.literal('townhouse')),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('properties', {
      ...args,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('properties'),
    updates: v.object({
      title: v.optional(v.string()),
      price: v.optional(v.number()),
      status: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id('properties') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

## Actions (External API Calls)

```typescript
// convex/uploads.ts
import { action } from './_generated/server';
import { v } from 'convex/values';
import { api } from './_generated/api';

export const analyzeWithGemini = action({
  args: { uploadId: v.id('uploads') },
  handler: async (ctx, args) => {
    // Get upload from database
    const upload = await ctx.runQuery(api.uploads.getById, { id: args.uploadId });
    if (!upload) throw new Error('Upload not found');
    
    // Update status to analyzing
    await ctx.runMutation(api.uploads.updateStatus, { 
      id: args.uploadId, 
      status: 'analyzing' 
    });
    
    // Call external API (Gemini)
    const response = await fetch('https://api.gemini.com/analyze', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GEMINI_API_KEY}` },
      body: JSON.stringify({ imageUrl: upload.fileUrl }),
    });
    
    const result = await response.json();
    
    // Store result
    await ctx.runMutation(api.uploads.updateAnalysis, {
      id: args.uploadId,
      analysisResult: result,
      status: 'complete',
    });
    
    return result;
  },
});
```

## Client Usage (React)

```typescript
// In React components
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function PropertyList() {
  // Realtime query - auto-updates when data changes!
  const properties = useQuery(api.properties.list);
  
  // Mutation
  const createProperty = useMutation(api.properties.create);
  
  const handleCreate = async () => {
    await createProperty({
      title: 'New Property',
      address: '123 Main St',
      price: 500000,
      bedrooms: 3,
      bathrooms: 2,
      type: 'house',
    });
  };
  
  if (!properties) return <LoadingSpinner />;
  
  return (
    <FlatList
      data={properties}
      renderItem={({ item }) => <PropertyCard property={item} />}
    />
  );
}
```

## Realtime Rooms (Collaborative Browsing)

```typescript
// convex/rooms.ts
export const join = mutation({
  args: { roomId: v.id('rooms'), userId: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error('Room not found');
    
    if (!room.participants.includes(args.userId)) {
      await ctx.db.patch(args.roomId, {
        participants: [...room.participants, args.userId],
      });
    }
    return room;
  },
});

export const getActive = query({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('rooms')
      .withIndex('by_property', (q) => q.eq('propertyId', args.propertyId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();
  },
});
```

## File Storage

```typescript
// Generate upload URL
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Get file URL
export const getFileUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
```

## Best Practices

1. **Use indexes** for frequently queried fields
2. **Mutations are transactional** - atomic operations
3. **Queries are reactive** - UI auto-updates
4. **Actions for external calls** - can't access DB directly
5. **Use `v.optional()`** for nullable fields
6. **Store timestamps as numbers** (Date.now())
