# HAUS Testing Strategy

**Comprehensive testing approach for the migration**

---

## TEST PYRAMID

```
         /\
        /  \
       / E2E \     <- Playwright (critical flows)
      /--------\
     /          \
    / Integration \  <- React Testing Library + Convex
   /--------------\
  /                \
 /     Unit Tests    \ <- Vitest/Jest (components, hooks)
/----------------------\
```

---

## 1. UNIT TESTING

### Component Tests

```typescript
// Component test structure
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

// Mock Convex
vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

describe("ComponentName", () => {
  // Setup
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Loading state
  it("should render loading skeleton", () => {
    (useQuery as jest.Mock).mockReturnValue(undefined);
    render(<Component id="123" />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  // Data state
  it("should render with data", () => {
    (useQuery as jest.Mock).mockReturnValue({
      id: "123",
      title: "Test Property",
    });
    render(<Component id="123" />);
    expect(screen.getByText("Test Property")).toBeInTheDocument();
  });

  // Empty state
  it("should render empty state", () => {
    (useQuery as jest.Mock).mockReturnValue(null);
    render(<Component id="123" />);
    expect(screen.getByText("No data found")).toBeInTheDocument();
  });

  // Error state
  it("should handle errors gracefully", () => {
    (useQuery as jest.Mock).mockReturnValue(new Error("Failed"));
    render(<Component id="123" />);
    expect(screen.getByText("Error loading data")).toBeInTheDocument();
  });

  // Interactions
  it("should handle user interactions", async () => {
    const mockMutate = vi.fn();
    (useQuery as jest.Mock).mockReturnValue({ id: "123" });
    (useMutation as jest.Mock).mockReturnValue(mockMutate);

    render(<Component id="123" />);
    fireEvent.click(screen.getByText("Action"));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ id: "123" });
    });
  });
});
```

### Hook Tests

```typescript
// Hook test structure
import { renderHook, act } from "@testing-library/react";
import { useFeature } from "./use-feature";

describe("useFeature", () => {
  it("should fetch data", () => {
    (useQuery as jest.Mock).mockReturnValue({ id: "123", name: "Test" });
    
    const { result } = renderHook(() => useFeature({ id: "123" }));
    
    expect(result.current.data).toEqual({ id: "123", name: "Test" });
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle mutations", async () => {
    const mockMutate = vi.fn().mockResolvedValue({});
    (useMutation as jest.Mock).mockReturnValue(mockMutate);

    const { result } = renderHook(() => useFeature({ id: "123" }));

    await act(async () => {
      await result.current.update({ name: "New Name" });
    });

    expect(mockMutate).toHaveBeenCalledWith({ id: "123", name: "New Name" });
  });
});
```

---

## 2. INTEGRATION TESTING

### Convex Integration

```typescript
// Convex function test
import { convexTest } from "convex-test";
import { test, expect } from "vitest";
import schema from "./schema";

const testApi = convexTest(schema);

describe("Convex Functions", () => {
  test("should create and retrieve a property", async () => {
    // Create
    const id = await testApi.mutation(api.properties.create, {
      title: "Test Property",
      price: 1000000,
    });

    // Retrieve
    const property = await testApi.query(api.properties.get, { id });
    
    expect(property).toMatchObject({
      title: "Test Property",
      price: 1000000,
    });
  });

  test("should search properties", async () => {
    // Seed data
    await testApi.mutation(api.properties.seed, {
      properties: [
        { title: "Property A", suburb: "Bondi", price: 1000000 },
        { title: "Property B", suburb: "Manly", price: 2000000 },
      ],
    });

    // Search
    const results = await testApi.query(api.properties.search, {
      filters: { suburb: "Bondi" },
    });

    expect(results).toHaveLength(1);
    expect(results[0].suburb).toBe("Bondi");
  });

  test("should enforce authentication", async () => {
    // Without auth, should throw
    await expect(
      testApi.mutation(api.properties.createProtected, {
        title: "Test",
      })
    ).rejects.toThrow("Unauthorized");
  });
});
```

### API Route Integration

```typescript
// API route test
import { testApiHandler } from "next-test-api-route-handler";
import { GET, POST } from "./route";

describe("API Routes", () => {
  test("GET /api/properties should return list", async () => {
    const res = await testApiHandler({
      pagesHandler: GET,
      params: { q: "search" },
      test: async ({ fetch }) => {
        const response = await fetch({ method: "GET" });
        expect(response.status).toBe(200);
        
        const json = await response.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
      },
    });
  });

  test("POST should require auth", async () => {
    const res = await testApiHandler({
      pagesHandler: POST,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: "POST",
          body: JSON.stringify({}),
        });
        expect(response.status).toBe(401);
      },
    });
  });
});
```

---

## 3. E2E TESTING

### Critical User Flows

```typescript
// E2E test with Playwright
test.describe("Critical Flows", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('[data-testid="email"]', "test@example.com");
    await page.fill('[data-testid="password"]', "password");
    await page.click('[data-testid="submit"]');
    await page.waitForURL("/");
  });

  test("property search flow", async ({ page }) => {
    // Navigate to search
    await page.goto("/search");
    
    // Enter search criteria
    await page.fill('[data-testid="location-input"]', "Bondi, NSW");
    await page.selectOption('[data-testid="property-type"]', "house");
    await page.click('[data-testid="search-button"]');
    
    // Wait for results
    await page.waitForSelector('[data-testid="property-card"]', {
      timeout: 10000,
    });
    
    // Verify results
    const cards = await page.locator('[data-testid="property-card"]').count();
    expect(cards).toBeGreaterThan(0);
    
    // Click on a property
    await page.click('[data-testid="property-card"]:first-child');
    await page.waitForSelector('[data-testid="property-detail"]');
    
    // Save to favorites
    await page.click('[data-testid="favorite-button"]');
    await page.waitForSelector('[data-testid="favorite-active"]');
  });

  test("voice search flow", async ({ page }) => {
    await page.goto("/search");
    
    // Click voice button
    await page.click('[data-testid="voice-button"]');
    await page.waitForSelector('[data-testid="voice-active"]');
    
    // Simulate voice input (in real test, use actual audio)
    // For now, test the UI flow
    await page.click('[data-testid="voice-close"]');
    await page.waitForSelector('[data-testid="voice-active"]', {
      state: "hidden",
    });
  });

  test("marketplace flow", async ({ page }) => {
    await page.goto("/market");
    
    // Browse categories
    await page.waitForSelector('[data-testid="category-card"]');
    await page.click('[data-testid="category-card"]:first-child');
    
    // View providers
    await page.waitForSelector('[data-testid="provider-card"]');
    await page.click('[data-testid="provider-card"]:first-child');
    
    // View provider profile
    await page.waitForSelector('[data-testid="provider-profile"]');
    
    // Request quote
    await page.click('[data-testid="quote-button"]');
    await page.fill('[data-testid="message"]', "Test message");
    await page.click('[data-testid="submit-quote"]');
    
    // Verify success
    await page.waitForSelector('[data-testid="quote-success"]');
  });

  test("academy flow", async ({ page }) => {
    await page.goto("/academy");
    
    // Browse courses
    await page.waitForSelector('[data-testid="course-card"]');
    
    // Start a course
    await page.click('[data-testid="course-card"]:first-child');
    await page.waitForSelector('[data-testid="lesson-content"]');
    
    // Complete lesson
    await page.click('[data-testid="complete-lesson"]');
    await page.waitForSelector('[data-testid="completion-celebration"]');
    
    // Check progress updated
    await page.goto("/academy/progress");
    const progress = await page.textContent('[data-testid="progress-percentage"]');
    expect(progress).not.toBe("0%");
  });
});
```

---

## 4. VISUAL REGRESSION TESTS

### Storybook + Chromatic

```typescript
// Component story with visual testing
import type { Meta, StoryObj } from "@storybook/react";
import { PropertyCard } from "./PropertyCard";

const meta: Meta<typeof PropertyCard> = {
  title: "Property/Card",
  component: PropertyCard,
  parameters: {
    chromatic: {
      viewports: [320, 768, 1200],
    },
  },
};

export default meta;
type Story = StoryObj<typeof PropertyCard>;

export const Default: Story = {
  args: {
    property: {
      id: "1",
      title: "Beautiful House",
      price: 1000000,
      // ...
    },
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    property: null,
  },
};
```

---

## 5. PERFORMANCE TESTS

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on: [push]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
```

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/search",
        "http://localhost:3000/property/123",
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:seo": ["warn", { minScore: 0.8 }],
      },
    },
  },
};
```

---

## 6. TEST COVERAGE REQUIREMENTS

### Minimum Coverage Thresholds

| Category | Threshold |
|----------|-----------|
| Unit Tests | 80% |
| Integration Tests | 70% |
| E2E Critical Flows | 100% |
| API Routes | 80% |
| Convex Functions | 70% |

### Coverage Report

```bash
# Run all tests with coverage
bun run test:coverage

# Check specific package
cd packages/backend && bun run test:coverage
cd apps/app && bun run test:coverage
cd apps/mobile && bun run test:coverage
```

---

## 7. TEST DATA MANAGEMENT

### Fixtures

```typescript
// test/fixtures/properties.ts
export const mockProperties = [
  {
    id: "prop-1",
    title: "Modern Beach House",
    address: "123 Bondi Road",
    suburb: "Bondi",
    state: "NSW",
    postcode: "2026",
    price: 2500000,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    propertyType: "house",
    images: ["https://example.com/image1.jpg"],
    coordinates: { lat: -33.8915, lng: 151.2767 },
  },
  // ... more fixtures
];

// test/fixtures/users.ts
export const mockUsers = [
  {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    preferences: {
      searchRadius: 10,
      priceMin: 500000,
      priceMax: 2000000,
    },
  },
];
```

### Factories

```typescript
// test/factories/property.ts
import { faker } from "@faker-js/faker";

export function createProperty(overrides = {}) {
  return {
    id: faker.string.uuid(),
    title: faker.location.streetAddress(),
    address: faker.location.streetAddress(),
    suburb: faker.location.city(),
    state: "NSW",
    postcode: faker.location.zipCode(),
    price: faker.number.int({ min: 500000, max: 5000000 }),
    bedrooms: faker.number.int({ min: 1, max: 5 }),
    bathrooms: faker.number.int({ min: 1, max: 3 }),
    parking: faker.number.int({ min: 0, max: 3 }),
    propertyType: faker.helpers.arrayElement(["house", "apartment", "townhouse"]),
    images: Array.from({ length: 5 }, () => faker.image.url()),
    ...overrides,
  };
}
```

---

## 8. CI/CD INTEGRATION

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install
      
      - name: Run type check
        run: bun run typecheck
      
      - name: Run lint
        run: bun run lint
      
      - name: Run unit tests
        run: bun run test:unit -- --coverage
      
      - name: Run integration tests
        run: bun run test:integration
        env:
          CONVEX_DEPLOYMENT: ${{ secrets.CONVEX_DEPLOYMENT }}
      
      - name: Run E2E tests
        run: bun run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 9. MOBILE TESTING

### React Native Testing Library

```typescript
// Mobile component test
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { PropertyCard } from "./PropertyCard";

describe("PropertyCard", () => {
  it("renders correctly", () => {
    const { getByText } = render(
      <PropertyCard property={mockProperties[0]} />
    );
    
    expect(getByText("Modern Beach House")).toBeTruthy();
    expect(getByText("$2,500,000")).toBeTruthy();
  });

  it("handles press events", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <PropertyCard property={mockProperties[0]} onPress={onPress} />
    );
    
    fireEvent.press(getByTestId("property-card"));
    expect(onPress).toHaveBeenCalled();
  });
});
```

---

## 10. TESTING CHECKLIST

### Before Merge

- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] E2E critical flows passing
- [ ] Type checking passing
- [ ] Linting passing
- [ ] No console errors in tests
- [ ] Visual regression tests passing
- [ ] Performance benchmarks met
- [ ] Accessibility tests passing

---

*Testing is not optional. It's a critical part of the migration.*
