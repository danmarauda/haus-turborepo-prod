---
name: haus-trpc-patterns
description: HAUS Platform tRPC patterns for type-safe API routes with Hono backend. Use when adding API routes, procedures, or working with tRPC client.
---

# HAUS tRPC Patterns

## Project Setup

### Files
- `backend/hono.ts` - Hono server with tRPC adapter
- `backend/trpc/create-context.ts` - tRPC context and router
- `backend/trpc/routes/` - Folder-based route organization
- `lib/trpc.ts` - Client configuration

## Creating Context

```typescript
// backend/trpc/create-context.ts
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

const t = initTRPC.create({
  transformer: superjson, // Handles Date, Map, Set, etc.
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

// Protected procedure (with auth)
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  // Check authentication
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
```

## Folder-Based Routes

```
backend/trpc/routes/
├── ai/
│   └── generate-text/
│       └── route.ts
├── properties/
│   ├── list/
│   │   └── route.ts
│   ├── [id]/
│   │   └── route.ts
│   └── search/
│       └── route.ts
└── example/
    └── hi/
        └── route.ts
```

## Creating Procedures

```typescript
// backend/trpc/routes/properties/list/route.ts
import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';

export const listProperties = publicProcedure
  .input(z.object({
    limit: z.number().min(1).max(100).default(20),
    cursor: z.string().optional(),
    status: z.enum(['active', 'pending', 'sold']).optional(),
  }))
  .query(async ({ input }) => {
    // Query properties from Convex or other source
    const properties = await fetchProperties({
      limit: input.limit,
      cursor: input.cursor,
      status: input.status,
    });
    
    return {
      items: properties,
      nextCursor: properties.length === input.limit 
        ? properties[properties.length - 1].id 
        : undefined,
    };
  });
```

## Mutation Example

```typescript
// backend/trpc/routes/properties/create/route.ts
import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

export const createProperty = protectedProcedure
  .input(z.object({
    title: z.string().min(3).max(100),
    address: z.string(),
    price: z.number().positive(),
    bedrooms: z.number().int().min(0),
    bathrooms: z.number().int().min(0),
    type: z.enum(['house', 'apartment', 'townhouse']),
    description: z.string().optional(),
    imageUrls: z.array(z.string().url()).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Create property in database
    const property = await db.properties.create({
      ...input,
      createdBy: ctx.user.id,
      createdAt: new Date(),
    });
    
    return property;
  });
```

## App Router Setup

```typescript
// backend/trpc/app-router.ts
import { router } from './create-context';
import { listProperties } from './routes/properties/list/route';
import { createProperty } from './routes/properties/create/route';
import { aiRouter } from './routes/ai/route';

export const appRouter = router({
  properties: router({
    list: listProperties,
    create: createProperty,
  }),
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
```

## Hono Integration

```typescript
// backend/hono.ts
import { Hono } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { appRouter } from './trpc/app-router';

const app = new Hono();

// tRPC endpoint
app.use('/api/trpc/*', trpcServer({
  router: appRouter,
  createContext: (opts) => ({
    // Add request-specific context
    req: opts.req,
    user: null, // Will be set by auth middleware
  }),
}));

export default app;
```

## Client Setup

```typescript
// lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/backend/trpc/app-router';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${process.env.EXPO_PUBLIC_API_URL}/api/trpc`,
      transformer: superjson,
      headers: async () => ({
        // Add auth headers
        Authorization: `Bearer ${await getToken()}`,
      }),
    }),
  ],
});
```

## Client Usage in Components

```typescript
// components/PropertyList.tsx
import { trpc } from '@/lib/trpc';

export function PropertyList() {
  // Query with infinite scroll
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isLoading 
  } = trpc.properties.list.useInfiniteQuery(
    { limit: 20, status: 'active' },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  
  const properties = data?.pages.flatMap(page => page.items) ?? [];
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <FlatList
      data={properties}
      renderItem={({ item }) => <PropertyCard property={item} />}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
    />
  );
}

// Mutation
export function CreatePropertyForm() {
  const utils = trpc.useUtils();
  
  const mutation = trpc.properties.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      utils.properties.list.invalidate();
    },
  });
  
  const handleSubmit = async (data: PropertyInput) => {
    await mutation.mutateAsync(data);
  };
  
  return (
    <Form onSubmit={handleSubmit} isLoading={mutation.isPending}>
      {/* Form fields */}
    </Form>
  );
}
```

## Error Handling

```typescript
import { TRPCError } from '@trpc/server';

// In procedure
if (!property) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: 'Property not found',
  });
}

// Client-side
const mutation = trpc.properties.create.useMutation({
  onError: (error) => {
    if (error.data?.code === 'NOT_FOUND') {
      Alert.alert('Error', 'Property not found');
    } else if (error.data?.code === 'UNAUTHORIZED') {
      router.push('/login');
    } else {
      Alert.alert('Error', error.message);
    }
  },
});
```

## Provider Setup

```typescript
// app/_layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Stack />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

## Best Practices

1. **Use Zod for all inputs** - Type-safe validation
2. **Use superjson transformer** - Handles complex types
3. **Organize routes by feature** - Folder-based structure
4. **Use protected procedures** for authenticated routes
5. **Invalidate queries** after mutations
6. **Handle errors with proper codes** (NOT_FOUND, UNAUTHORIZED, etc.)
