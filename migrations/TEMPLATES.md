# HAUS Migration - Templates & Patterns

**Reusable templates for migration tasks**

---

## COMPONENT MIGRATION TEMPLATE

### Web Component Template

```tsx
// apps/app/src/components/[feature]/[ComponentName].tsx
"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@v1/backend/convex";
import { 
  Card, 
  Button, 
  Input,
  // ... other @v1/ui imports 
} from "@v1/ui";
import { cn } from "@v1/ui/utils";
import { useCortexMemory } from "@/hooks/use-cortex-memory";

// ============================================================================
// TYPES
// ============================================================================

interface ComponentNameProps {
  // Define all props here
  prop1: string;
  prop2?: number;
  onAction?: (data: SomeType) => void;
}

interface SomeType {
  id: string;
  name: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ComponentName({ 
  prop1, 
  prop2 = 0, 
  onAction 
}: ComponentNameProps) {
  // ------------------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------------------
  const [isLoading, setIsLoading] = useState(false);
  const [localState, setLocalState] = useState("");
  
  // ------------------------------------------------------------------------
  // DATA FETCHING (Convex)
  // ------------------------------------------------------------------------
  const data = useQuery(api.feature.get, { id: prop1 });
  const mutate = useMutation(api.feature.update);
  const cortex = useCortexMemory({ userId: data?.userId, enabled: true });
  
  // ------------------------------------------------------------------------
  // HANDLERS
  // ------------------------------------------------------------------------
  const handleAction = useCallback(async () => {
    setIsLoading(true);
    try {
      await mutate({ id: prop1, data: localState });
      
      // Remember in Cortex
      await cortex.rememberInteraction({
        type: "action",
        description: `User performed action on ${prop1}`,
      });
      
      onAction?.({ id: prop1, name: localState });
    } finally {
      setIsLoading(false);
    }
  }, [prop1, localState, mutate, cortex, onAction]);
  
  // ------------------------------------------------------------------------
  // RENDER HELPERS
  // ------------------------------------------------------------------------
  if (data === undefined) {
    return <ComponentSkeleton />;
  }
  
  if (data === null) {
    return <ComponentEmpty />;
  }
  
  // ------------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------------
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{data.title}</h2>
        
        <Input
          value={localState}
          onChange={(e) => setLocalState(e.target.value)}
          placeholder="Enter value..."
        />
        
        <Button 
          onClick={handleAction}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Loading..." : "Action"}
        </Button>
      </div>
    </Card>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ComponentSkeleton() {
  return (
    <Card className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-3/4" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
      </div>
    </Card>
  );
}

function ComponentEmpty() {
  return (
    <Card className="p-6 text-center">
      <p className="text-muted-foreground">No data found</p>
    </Card>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ComponentName;
```

---

### Mobile Component Template

```tsx
// apps/mobile/components/[feature]/[ComponentName].tsx

import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@v1/backend/convex";
import { useCortexMemory } from "@/hooks/useCortexMemory";

// ============================================================================
// TYPES
// ============================================================================

interface ComponentNameProps {
  prop1: string;
  prop2?: number;
  onAction?: (data: SomeType) => void;
}

interface SomeType {
  id: string;
  name: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ComponentName({ 
  prop1, 
  prop2 = 0, 
  onAction 
}: ComponentNameProps) {
  // ------------------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------------------
  const [isLoading, setIsLoading] = useState(false);
  const [localState, setLocalState] = useState("");
  
  // ------------------------------------------------------------------------
  // DATA FETCHING (Convex)
  // ------------------------------------------------------------------------
  const data = useQuery(api.feature.get, { id: prop1 });
  const mutate = useMutation(api.feature.update);
  const cortex = useCortexMemory({ 
    convex: useConvex(), 
    userId: data?.userId, 
    enabled: true 
  });
  
  // ------------------------------------------------------------------------
  // HANDLERS
  // ------------------------------------------------------------------------
  const handleAction = useCallback(async () => {
    setIsLoading(true);
    try {
      await mutate({ id: prop1, data: localState });
      
      await cortex.rememberInteraction({
        type: "action",
        description: `User performed action on ${prop1}`,
      });
      
      onAction?.({ id: prop1, name: localState });
    } finally {
      setIsLoading(false);
    }
  }, [prop1, localState, mutate, cortex, onAction]);
  
  // ------------------------------------------------------------------------
  // RENDER HELPERS
  // ------------------------------------------------------------------------
  if (data === undefined) {
    return <ComponentSkeleton />;
  }
  
  if (data === null) {
    return <ComponentEmpty />;
  }
  
  // ------------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------------
  return (
    <View className="bg-card p-4 rounded-xl">
      <View className="space-y-4">
        <Text className="text-2xl font-bold text-foreground">
          {data.title}
        </Text>
        
        <TextInput
          value={localState}
          onChangeText={setLocalState}
          placeholder="Enter value..."
          className="bg-input text-foreground p-3 rounded-lg"
        />
        
        <TouchableOpacity 
          onPress={handleAction}
          disabled={isLoading}
          className="bg-primary p-4 rounded-lg"
        >
          <Text className="text-primary-foreground text-center font-semibold">
            {isLoading ? "Loading..." : "Action"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ComponentSkeleton() {
  return (
    <View className="bg-card p-4 rounded-xl">
      <View className="animate-pulse space-y-4">
        <View className="h-8 bg-muted rounded w-3/4" />
        <View className="h-10 bg-muted rounded" />
        <View className="h-10 bg-muted rounded" />
      </View>
    </View>
  );
}

function ComponentEmpty() {
  return (
    <View className="bg-card p-4 rounded-xl items-center">
      <Text className="text-muted-foreground">No data found</Text>
    </View>
  );
}
```

---

## API ROUTE TEMPLATE

### Web API Route Template

```typescript
// apps/app/src/app/api/[feature]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@v1/backend/convex/auth";
import { rateLimit } from "@/lib/rate-limit";

// ============================================================================
// RATE LIMITING
// ============================================================================

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

// ============================================================================
// POST HANDLER
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = req.ip ?? "127.0.0.1";
    try {
      await limiter.check(10, ip); // 10 requests per minute
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }
    
    // 2. Authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // 3. Parse request
    const body = await req.json();
    
    // 4. Validate input
    if (!body.requiredField) {
      return NextResponse.json(
        { error: "Missing required field" },
        { status: 400 }
      );
    }
    
    // 5. Process request
    // const result = await processFeature(body);
    
    // 6. Return response
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    // 1. Auth check (optional for public endpoints)
    const session = await auth();
    
    // 2. Parse query params
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");
    
    // 3. Fetch data
    // const data = await fetchFeatureData({ filter });
    
    // 4. Return response
    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
    
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## PAGE TEMPLATE

### Web Page Template

```tsx
// apps/app/src/app/[locale]/[feature]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeatureComponent } from "@/components/[feature]/FeatureComponent";

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: "Feature Name | HAUS",
  description: "Description of the feature",
};

// ============================================================================
// PAGE COMPONENT
// ============================================================================

interface PageProps {
  params: {
    locale: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function FeaturePage({ 
  params, 
  searchParams 
}: PageProps) {
  // Validate locale
  const { locale } = params;
  
  // Fetch initial data (server-side)
  // const initialData = await fetchInitialData();
  
  // Handle not found
  // if (!initialData) {
  //   notFound();
  // }
  
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Feature Title</h1>
        
        <FeatureComponent 
          initialData={initialData}
          searchParams={searchParams}
        />
      </div>
    </main>
  );
}
```

---

### Mobile Screen Template

```tsx
// apps/mobile/app/(tabs)/[feature].tsx OR app/[feature]/index.tsx

import { Stack } from "expo-router";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FeatureComponent } from "@/components/[feature]/FeatureComponent";

// ============================================================================
// SCREEN COMPONENT
// ============================================================================

export default function FeatureScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen 
        options={{ 
          title: "Feature Title",
          headerShown: true,
        }} 
      />
      
      <ScrollView className="flex-1">
        <View className="p-4">
          <FeatureComponent />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## HOOK TEMPLATE

### Web Hook Template

```typescript
// apps/app/src/hooks/use-[feature].ts

import { useCallback, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@v1/backend/convex";

// ============================================================================
// TYPES
// ============================================================================

interface UseFeatureOptions {
  id: string;
  enabled?: boolean;
}

interface UseFeatureReturn {
  data: FeatureData | undefined;
  isLoading: boolean;
  error: Error | null;
  update: (updates: Partial<FeatureData>) => Promise<void>;
  refetch: () => void;
}

interface FeatureData {
  id: string;
  name: string;
  // ... other fields
}

// ============================================================================
// HOOK
// ============================================================================

export function useFeature({ id, enabled = true }: UseFeatureOptions): UseFeatureReturn {
  // ------------------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------------------
  const [error, setError] = useState<Error | null>(null);
  
  // ------------------------------------------------------------------------
  // DATA FETCHING
  // ------------------------------------------------------------------------
  const data = useQuery(
    api.feature.get,
    enabled ? { id } : "skip"
  );
  
  // ------------------------------------------------------------------------
  // MUTATIONS
  // ------------------------------------------------------------------------
  const updateMutation = useMutation(api.feature.update);
  
  // ------------------------------------------------------------------------
  // ACTIONS
  // ------------------------------------------------------------------------
  const update = useCallback(async (updates: Partial<FeatureData>) => {
    try {
      setError(null);
      await updateMutation({ id, ...updates });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Update failed"));
      throw err;
    }
  }, [id, updateMutation]);
  
  const refetch = useCallback(() => {
    // Convex handles refetching automatically
    // This is for API compatibility
  }, []);
  
  // ------------------------------------------------------------------------
  // RETURN
  // ------------------------------------------------------------------------
  return {
    data,
    isLoading: data === undefined && enabled,
    error,
    update,
    refetch,
  };
}
```

---

### Mobile Hook Template

```typescript
// apps/mobile/hooks/use[Feature].ts

import { useCallback, useState } from "react";
import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "@v1/backend/convex";

// ============================================================================
// TYPES
// ============================================================================

interface UseFeatureOptions {
  id: string;
  enabled?: boolean;
}

interface UseFeatureReturn {
  data: FeatureData | undefined;
  isLoading: boolean;
  error: Error | null;
  update: (updates: Partial<FeatureData>) => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useFeature({ id, enabled = true }: UseFeatureOptions): UseFeatureReturn {
  const convex = useConvex();
  const [error, setError] = useState<Error | null>(null);
  
  const data = useQuery(
    api.feature.get,
    enabled ? { id } : "skip"
  );
  
  const updateMutation = useMutation(api.feature.update);
  
  const update = useCallback(async (updates: Partial<FeatureData>) => {
    try {
      setError(null);
      await updateMutation({ id, ...updates });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Update failed"));
      throw err;
    }
  }, [id, updateMutation, convex]);
  
  return {
    data,
    isLoading: data === undefined && enabled,
    error,
    update,
  };
}
```

---

## TEST TEMPLATE

### Component Test Template

```typescript
// apps/app/src/components/[feature]/[Component].test.tsx

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Component } from "./Component";

// ============================================================================
// MOCKS
// ============================================================================

jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

// ============================================================================
// TESTS
// ============================================================================

describe("Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it("should render loading state", () => {
    (useQuery as jest.Mock).mockReturnValue(undefined);
    
    render(<Component id="123" />);
    
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });
  
  it("should render data", () => {
    (useQuery as jest.Mock).mockReturnValue({
      id: "123",
      title: "Test Title",
    });
    
    render(<Component id="123" />);
    
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });
  
  it("should handle actions", async () => {
    const mockMutate = jest.fn();
    (useQuery as jest.Mock).mockReturnValue({ id: "123", title: "Test" });
    (useMutation as jest.Mock).mockReturnValue(mockMutate);
    
    render(<Component id="123" />);
    
    fireEvent.click(screen.getByText("Action"));
    
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });
});
```

---

## STORYBOOK TEMPLATE

```tsx
// apps/app/src/components/[feature]/[Component].stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { Component } from "./Component";

// ============================================================================
// META
// ============================================================================

const meta: Meta<typeof Component> = {
  title: "Feature/Component",
  component: Component,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Component>;

// ============================================================================
// STORIES
// ============================================================================

export const Default: Story = {
  args: {
    prop1: "value1",
    prop2: 42,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    data: null,
  },
};
```

---

*Use these templates as starting points for all migration tasks.*
