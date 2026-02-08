# Feature Parity Analysis

> **Current Status**: Near Complete Parity - All Phase 1 & 2 Features Implemented
> **Last Updated**: 2026-02-01

## Executive Summary

| Category | Status | Notes |
|----------|--------|-------|
| **Core SDK** | ✅ Complete | Expo 55, Router 7, RN 0.81 |
| **Infrastructure** | ✅ Complete | Auth, i18n, Sentry, Cache, Payments |
| **Auth Screens** | ✅ Complete | Login, Register, Reset, Welcome with JWT |
| **Payment Contexts** | ✅ Complete | RevenueCat + Stripe providers integrated |
| **Settings Screen** | ✅ Complete | Language, theme, account management |
| **Premium Features** | ✅ Complete | Subscription UI with pricing cards |
| **Notifications** | ✅ Complete | Notification center screen |
| **Onboarding** | ✅ Complete | Welcome/onboarding flow |
| **UI Components** | ⚠️ Partial | @rn-primitives library (optional) |

---

## Detailed Parity Matrix

### 1. Context Providers

| Context | expobase-standard | expo-ai-chatbot | HAUS Mobile | Status |
|---------|-------------------|-----------------|-------------|--------|
| `AuthContext` | ✅ | ✅ | ✅ | JWT integrated with Convex |
| `ThemeContext` | ✅ | ❌ | ✅ | Dark/light/system modes |
| `RevenueCatContext` | ✅ | ❌ | ✅ | Convex sync included |
| `StripeContext` | ✅ | ❌ | ✅ | Configured for payments |
| `SidebarContext` | ✅ | ❌ | ❌ | Optional |

### 2. Authentication Screens

| Screen | expobase-standard | expo-ai-chatbot | HAUS Mobile | Status |
|--------|-------------------|-----------------|-------------|--------|
| Sign In | ✅ | ✅ | ✅ | JWT + Convex integration |
| Sign Up | ✅ | ✅ | ✅ | JWT + Convex integration |
| Welcome | ✅ | ❌ | ✅ | Created |
| Reset Password | ✅ | ❌ | ✅ | Created |
| Onboarding | ✅ | ❌ | ✅ | Created |

### 3. Protected/Tabs Screens

| Screen | expobase-standard | HAUS Mobile | Status |
|--------|-------------------|-------------|--------|
| Home (index) | ✅ | ✅ | Exists |
| Profile | ✅ | ✅ | Exists |
| Settings | ✅ | ✅ | **Created** |
| Premium/Payment | ✅ | ✅ | **Created** (587 lines) |
| Offline | ✅ | ❌ | Optional |
| Tasks | ✅ | ❌ | Optional |
| Playground | ✅ | ❌ | Optional |
| AI Chat | ✅ | ❌ | Optional |
| Notifications | ✅ | ✅ | **Created** |

### 4. HAUS-Specific Screens (Unique)

| Screen | Status | Notes |
|--------|--------|-------|
| Search | ✅ | Voice search |
| Voice | ✅ | LiveKit integration |
| Agency | ✅ | Commercial/agency |
| Market | ✅ | Marketplace |
| Property/[id] | ✅ | Details modal |

### 5. UI Components Library

| Category | expobase-standard | HAUS Mobile | Status |
|----------|-------------------|-------------|--------|
| @rn-primitives | ✅ (11 components) | ❌ | Optional |
| Components/auth | ✅ (6 components) | ✅ | Integrated |
| Components/payment | ✅ (7 components) | ✅ | Via Premium screen |
| Components/premium | ✅ (7 components) | ✅ | Via Premium screen |
| Components/settings | ✅ (8 components) | ✅ | Via Settings screen |
| Components/ai | ✅ (11 components) | ❌ | Optional |
| Components/notifications | ✅ (11 components) | ✅ | Via Notifications screen |
| Components/onboarding | ✅ (10 components) | ✅ | Via Onboarding flow |

---

## Files Created (Orchestration Session)

| File | Lines | Description |
|------|-------|-------------|
| `context/RevenueCatContext.tsx` | 249 | Subscription provider with Convex sync |
| `context/StripeContext.tsx` | ~40 | Stripe payment provider wrapper |
| `app/(tabs)/settings.tsx` | ~280 | Language, theme, account settings |
| `app/(tabs)/premium.tsx` | 587 | Subscription UI with pricing cards |
| `app/(tabs)/notifications.tsx` | ~200 | Notification center |
| `app/(auth)/welcome.tsx` | ~100 | Welcome screen |
| `app/(auth)/reset-password.tsx` | ~150 | Password reset flow |
| `app/onboarding/index.tsx` | ~300 | Onboarding flow |

---

## Features by Source

### From expobase-standard

| Feature | Implemented? | Notes |
|---------|--------------|-------|
| i18n setup | ✅ | 4 languages |
| Sentry integration | ✅ | Needs DSN |
| Network-aware cache | ✅ | MMKV persistence |
| RevenueCat provider | ✅ | Context + Premium screen |
| Stripe provider | ✅ | Context created |
| Auth screens (full) | ✅ | All screens complete |
| Settings screen | ✅ | Complete with theme/language |
| Premium/paywall screens | ✅ | Complete with pricing |
| Onboarding flow | ✅ | Complete |
| Notifications UI | ✅ | Complete |
| Tasks/Reminders | ❌ | Optional |

### From expo-ai-chatbot-pro

| Feature | Implemented? | Notes |
|---------|--------------|-------|
| JWT token auth | ✅ | Utilities + integration |
| Auth context | ✅ | Created + integrated |
| LiveKit voice | ✅ | Already existed |
| AI chat UI | ❌ | Optional |
| History drawer | ❌ | Optional |
| Image attachments | ❌ | Optional |
| Markdown display | ✅ | Package added |
| Suggested actions | ❌ | Optional |

---

## Provider Stack (Root Layout)

```
GestureHandlerRootView
  SafeAreaProvider
    ThemeProvider
      QueryClientProvider
        ConvexProvider
          AuthProvider
            RevenueCatProvider
              StripeProvider
                RootLayoutContent
                  Toaster
```

---

## Design System Parity

| Aspect | Status | Notes |
|--------|--------|-------|
| NativeWind 4 | ✅ | Configured |
| Tailwind CSS | ✅ | v3.4 |
| Theme variables | ✅ | ThemeContext with 3 modes |
| Design tokens | ✅ | HAUS dark theme (#0a0a0a) |
| Component library | ⚠️ | Using inline styles (optional: @rn-primitives) |
| Animation library | ✅ | Reanimated 4.1 |

---

## Environment Variables Needed

Add to `.env.local`:

```bash
# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# RevenueCat
EXPO_PUBLIC_RC_IOS=ios_key_...
EXPO_PUBLIC_RC_ANDROID=android_key_...
EXPO_PUBLIC_RC_SUBSCRIPTION_NAME=pro

# Sentry
EXPO_PUBLIC_SENTRY_DSN=https://...

# JWT
EXPO_PUBLIC_JWT_SECRET=your-production-secret
```

---

## Summary

**Infrastructure**: ✅ 100% Complete
**Features**: ✅ 95% Complete
**UI Components**: ⚠️ 70% Complete (@rn-primitives optional)

**Overall Parity**: ✅ ~95% Achieved

---

## Recent Updates (2026-02-01)

### Convex Premium Sync (Complete)
- **Schema**: Added premium fields to users table (revenueCatId, isPremium, premiumExpiresAt, etc.)
- **Mutations**:
  - `users.syncPremiumStatus` - Syncs subscription from RevenueCat
  - `users.linkRevenueCatAccount` - Links RevenueCat ID to authenticated user
  - `users.getPremiumStatus` - Queries premium status for current user
- **Auth Integration**: signIn/signUp now automatically link RevenueCat account

---

## Optional Enhancements (Phase 3)

These items are **not required for parity** but could be added for completeness:

1. **@rn-primitives Components** - Reusable component library (Avatar, Checkbox, Dialog, etc.)
2. **AI Chat Screen** - Chat UI with history and suggested actions
3. **Tasks/Reminders** - Task list with CRUD operations
4. **Offline Screen** - Offline status indicator
5. **Playground Screen** - API testing interface

---

## Testing Checklist

### Maestro Test Suite Created

Located in `.maestro/` directory:

| Test File | Coverage | Status |
|-----------|----------|--------|
| `01-onboarding.yaml` | Welcome → swipe → Get Started | ✅ Created |
| `02-signup.yaml` | Sign up flow with form validation | ✅ Created |
| `03-signin.yaml` | Sign in flow | ✅ Created |
| `04-tabs.yaml` | All tabs navigation | ✅ Created |
| `05-settings.yaml` | Language, theme, sign out | ✅ Created |
| `06-premium.yaml` | Premium features and pricing | ✅ Created |
| `smoke-test.yaml` | Full E2E test (onboarding → auth → tabs → settings) | ✅ Created |

### Manual Testing

- [ ] Run `bun install` to ensure all dependencies are installed
- [ ] Run `bun run dev` to start the development server
- [ ] Test auth flow: Sign in → Sign up → Sign out
- [ ] Test settings: Language change, theme toggle
- [ ] Test premium: Navigate to premium tab, view pricing
- [ ] Test notifications: Navigate to notifications tab
- [ ] Test onboarding: First launch flow
- [ ] Verify RevenueCat initializes (check console logs)
- [ ] Verify Stripe initializes (check console logs)

---

## Known Issues

### Expo 55 Build Error (2026-02-01)

**Status**: Blocked by Expo SDK 55 beta compatibility issues

**Error**:
```
expo-modules-core/ios/Worklets/WorkletJSCallInvoker.cpp:19:19
error: no member named 'schedule' in 'worklets::WorkletRuntime'
error: too few arguments to function call, expected 2, have 1
```

**Root Cause**: Expo 55.0.0-preview.7 is in beta preview. The `expo-modules-core` package has compatibility issues with the latest React Native 0.81's WorkletRuntime API.

**Workaround Options**:

1. **Use EAS Build** (Recommended):
   ```bash
   eas build --platform ios --profile development
   ```
   EAS handles compilation remotely with cached builds.

2. **Downgrade to Expo 54** (Stable):
   ```bash
   # Edit package.json: "expo": "~54.0.0"
   # Edit package.json: "expo-router": "~3.0.0"
   bun install
   ```

3. **Wait for Expo 55 Stable Release**: Track [Expo SDK releases](https://github.com/expo/expo/releases)

**Maestro Testing**: Currently blocked by native build failure. Once app is buildable:
```bash
# Run all tests
maestro test .maestro/smoke-test.yaml

# Run individual test
maestro test .maestro/04-tabs.yaml
```
