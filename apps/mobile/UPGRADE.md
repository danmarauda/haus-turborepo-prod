# HAUS Mobile - Expo 55 + Router 7 Upgrade

> **Status**: Complete (Beta/Preview versions)
> **Date**: 2026-02-01
> **From**: Expo 54 + Router 4 → **To**: Expo 55.0.0-preview.7 + Router 55.0.0-beta.4

## Summary

This upgrade brings the HAUS mobile app to the latest Expo SDK 55 (preview) and Expo Router 7 (beta), along with comprehensive features from reference repos:

- **expo-ai-chatbot-pro**: JWT authentication, LiveKit voice agent, AI SDK integration
- **expobase-standard**: i18n, Sentry, payments, Supabase patterns

## What Changed

### Dependencies

| Package | Before | After |
|---------|--------|-------|
| expo | ~54.0.32 | 55.0.0-preview.7 |
| expo-router | ~4.0.22 | 55.0.0-beta.4 |
| react-native | ~0.79.0 | ~0.81.0 |
| react-native-reanimated | ~3.17.0 | ~4.1.1 |
| react-native-screens | ~4.10.0 | ~4.16.0 |

### New Packages Added

| Package | Purpose |
|---------|---------|
| `jose` | JWT token creation/verification |
| `i18next` + `react-i18next` | Internationalization |
| `@sentry/react-native` | Error tracking |
| `@stripe/stripe-react-native` | Payments |
| `react-native-purchases` | RevenueCat subscriptions |
| `sonner-native` | Toast notifications |
| `zod` | Schema validation |
| `zustand` | State management |
| `@react-native-async-storage/async-storage` | Async storage |
| `@react-native-community/netinfo` | Network status |
| `expo-apple-authentication` | Sign in with Apple |
| `expo-clipboard` | Clipboard access |
| `expo-system-ui` | System UI controls |

## New Files Created

### Configuration
- `config/i18n.ts` - i18next setup with 4 languages (en, es, fr, pt)
- `config/supabase.ts` - Optional Supabase integration

### Authentication
- `services/auth/token.ts` - JWT token utilities (create, verify, extract)
- `services/auth/useAuth.tsx` - Auth context with JWT + Convex integration
- `services/auth/index.ts` - Auth module exports

### Hooks
- `hooks/useNetworkStatus.ts` - Network connectivity monitoring

### Locales
- `locales/en.json` - English translations
- `locales/es.json` - Spanish translations
- `locales/fr.json` - French translations
- `locales/pt.json` - Portuguese translations

### Updated Files
- `app/_layout.tsx` - Added Sentry, AuthProvider, i18n, Toaster, AppInitializer
- `app.json` - Added new plugins and locales config
- `package.json` - All dependencies updated

## Features Added

### 1. JWT Authentication
- Token-based auth with `jose` library
- SecureStore for token persistence
- Convex integration for user management
- Auto token expiration handling

**Usage:**
```tsx
import { useAuth } from '@/services/auth';

const { signIn, signOut, isAuthenticated, user } = useAuth();
```

### 2. Internationalization (i18n)
- 4 supported languages (en, es, fr, pt)
- Automatic language detection
- Persistent language preference
- Translation files in `/locales`

**Usage:**
```tsx
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<Text>{t('auth.signIn')}</Text>
```

### 3. Sentry Error Tracking
- Automatic error capture
- Feedback integration
- Performance monitoring
- Disabled by default (requires `EXPO_PUBLIC_SENTRY_DSN`)

### 4. Network-Aware Cache Persistence
- MMKV-based React Query persistence
- Periodic backup when online
- Save on app background
- Restore on app launch

### 5. Toast Notifications
- Sonner-native for beautiful toasts
- Success/error/info variants
- Auto-dismiss with progress bar

**Usage:**
```tsx
import { toast } from 'sonner-native';
toast.success('Welcome back!');
toast.error('Something went wrong');
```

## Breaking Changes

### React Native Reanimated 4.x
- Update Reanimated imports if using `Animated`
- Check custom animations for compatibility

### React Native 0.81
- Some third-party libraries may need updates
- Check Gesture Handler usage

### Expo Router 7 (Beta)
- Route group syntax unchanged (still using `(tabs)`, `(auth)`)
- Typed routes remain experimental
- Watch for beta-specific issues

## Environment Variables

Add these to your `.env.local`:

```bash
# Sentry (optional)
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn

# JWT Secret (for token creation)
EXPO_PUBLIC_JWT_SECRET=your-production-secret

# API URL (for auth endpoints)
EXPO_PUBLIC_API_URL=https://your-api.com

# Supabase (optional, for additional features)
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Next Steps

1. **Install dependencies**: `bun install`
2. **Run dev server**: `bun run dev`
3. **Test auth flow**: Sign in/sign up with Convex
4. **Test i18n**: Change language in settings
5. **Test voice**: Verify LiveKit still works
6. **Test payments**: Add Stripe/RevenueCat if needed

## Optional Integrations

### Stripe Payments
1. Configure Stripe dashboard
2. Add Stripe keys to `.env`
3. Use `@stripe/stripe-react-native` components

### Supabase
1. Create Supabase project
2. Add credentials to `.env`
3. Use for realtime/storage features

### RevenueCat
1. Configure RevenueCat dashboard
2. Add offerings to project
3. Use `react-native-purchases` for subscriptions

## Known Issues

- Expo 55 is still in preview - expect some instability
- Router 7 beta may have breaking changes before final release
- Some Expo 54 modules may not have 55-compatible versions yet

## Rollback

If you need to rollback to Expo 54:
1. Restore `package.json` and `app.json` from git
2. Remove new config files: `config/`, `services/auth/`, `locales/`
3. `bun install`
4. `bun run prebuild:clean`

## Support

For issues with:
- **Expo SDK**: https://expo.dev/changelog
- **Expo Router**: https://github.com/expo/expo/tree/main/packages/expo-router
- **Reference repos**: ~/dev/expo-ai-chatbot-pro, ~/dev/expobase-standard
