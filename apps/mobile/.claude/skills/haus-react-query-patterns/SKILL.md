---
name: haus-react-query-patterns
description: HAUS Platform React Query patterns for data fetching, caching, and state management. Use when implementing queries, mutations, or optimistic updates.
---

# HAUS React Query Patterns

## Project Setup

### Dependencies
- `@tanstack/react-query` - Data fetching
- `@nkzw/create-context-hook` - Context helpers

## Query Client Configuration

```typescript
// In app/_layout.tsx or providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false, // Disable for mobile
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

## Basic Query Pattern

```typescript
import { useQuery } from '@tanstack/react-query';

export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const response = await fetch(`/api/properties?${new URLSearchParams(filters)}`);
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json() as Promise<Property[]>;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Usage
function PropertyList() {
  const { data: properties, isLoading, error, refetch } = useProperties({ 
    status: 'active' 
  });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView error={error} onRetry={refetch} />;
  
  return (
    <FlatList
      data={properties}
      renderItem={({ item }) => <PropertyCard property={item} />}
    />
  );
}
```

## Infinite Query (Pagination)

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

export function useInfiniteProperties() {
  return useInfiniteQuery({
    queryKey: ['properties', 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/properties?cursor=${pageParam}&limit=20`);
      return response.json() as Promise<{
        items: Property[];
        nextCursor?: string;
      }>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    getPreviousPageParam: (firstPage) => firstPage.previousCursor,
  });
}

// Usage
function InfinitePropertyList() {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    isLoading 
  } = useInfiniteProperties();
  
  const properties = data?.pages.flatMap(page => page.items) ?? [];
  
  return (
    <FlatList
      data={properties}
      renderItem={({ item }) => <PropertyCard property={item} />}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingNextPage ? <LoadingSpinner /> : null}
    />
  );
}
```

## Mutation Pattern

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateProperty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newProperty: CreatePropertyInput) => {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProperty),
      });
      if (!response.ok) throw new Error('Failed to create property');
      return response.json() as Promise<Property>;
    },
    onSuccess: (newProperty) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      
      // Or update cache directly
      queryClient.setQueryData(['properties', newProperty.id], newProperty);
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
}

// Usage
function CreatePropertyForm() {
  const mutation = useCreateProperty();
  
  const handleSubmit = async (data: CreatePropertyInput) => {
    await mutation.mutateAsync(data);
    router.back();
  };
  
  return (
    <Form 
      onSubmit={handleSubmit} 
      isLoading={mutation.isPending}
      error={mutation.error?.message}
    />
  );
}
```

## Optimistic Updates

```typescript
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ propertyId, isFavorite }: ToggleFavoriteInput) => {
      const response = await fetch(`/api/favorites/${propertyId}`, {
        method: isFavorite ? 'DELETE' : 'POST',
      });
      return response.json();
    },
    
    // Optimistic update
    onMutate: async ({ propertyId, isFavorite }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      
      // Snapshot previous value
      const previousFavorites = queryClient.getQueryData(['favorites']);
      
      // Optimistically update
      queryClient.setQueryData<string[]>(['favorites'], (old) => {
        if (!old) return isFavorite ? [] : [propertyId];
        return isFavorite 
          ? old.filter(id => id !== propertyId)
          : [...old, propertyId];
      });
      
      return { previousFavorites };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['favorites'], context?.previousFavorites);
    },
    
    // Refetch after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
```

## Prefetching

```typescript
import { useQueryClient } from '@tanstack/react-query';

function PropertyCard({ property }: { property: Property }) {
  const queryClient = useQueryClient();
  
  // Prefetch detail on hover/press-in
  const prefetchDetail = () => {
    queryClient.prefetchQuery({
      queryKey: ['property', property.id],
      queryFn: () => fetchPropertyDetail(property.id),
      staleTime: 1000 * 60 * 5,
    });
  };
  
  return (
    <Pressable 
      onPressIn={prefetchDetail}
      onPress={() => router.push(`/property/${property.id}`)}
    >
      {/* Card content */}
    </Pressable>
  );
}
```

## Dependent Queries

```typescript
function PropertyWithAgent({ propertyId }: { propertyId: string }) {
  // First query
  const propertyQuery = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => fetchProperty(propertyId),
  });
  
  // Dependent query - only runs when property is loaded
  const agentQuery = useQuery({
    queryKey: ['agent', propertyQuery.data?.agentId],
    queryFn: () => fetchAgent(propertyQuery.data!.agentId),
    enabled: !!propertyQuery.data?.agentId, // Only run when agentId exists
  });
  
  if (propertyQuery.isLoading) return <LoadingSpinner />;
  
  return (
    <View>
      <PropertyDetail property={propertyQuery.data} />
      {agentQuery.isLoading ? (
        <AgentSkeleton />
      ) : (
        <AgentCard agent={agentQuery.data} />
      )}
    </View>
  );
}
```

## Query Keys Best Practices

```typescript
// Create a query key factory
export const propertyKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyKeys.all, 'list'] as const,
  list: (filters: PropertyFilters) => [...propertyKeys.lists(), filters] as const,
  details: () => [...propertyKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
};

// Usage
useQuery({
  queryKey: propertyKeys.detail(propertyId),
  queryFn: () => fetchProperty(propertyId),
});

// Invalidate all property queries
queryClient.invalidateQueries({ queryKey: propertyKeys.all });

// Invalidate only lists
queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
```

## Combining with Convex

```typescript
// React Query is for tRPC/REST calls
// Convex has its own hooks (useQuery from convex/react)

// For hybrid data:
function PropertyWithRatings({ propertyId }: { propertyId: string }) {
  // Convex for realtime data
  const property = useConvexQuery(api.properties.getById, { id: propertyId });
  
  // React Query for external API
  const ratings = useReactQuery({
    queryKey: ['ratings', propertyId],
    queryFn: () => fetchExternalRatings(propertyId),
    enabled: !!property,
  });
  
  return (
    <View>
      <PropertyDetail property={property} />
      <RatingsDisplay ratings={ratings.data} />
    </View>
  );
}
```

## Error Boundary Integration

```typescript
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset}>
          <PropertyList />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

## Best Practices

1. **Use query key factories** for consistent keys
2. **Set staleTime appropriately** - 5 min for most data
3. **Use enabled for dependent queries** - avoid unnecessary fetches
4. **Implement optimistic updates** for better UX
5. **Prefetch on hover/press-in** for instant navigation
6. **Invalidate related queries** after mutations
7. **Use select** to transform data at query level
