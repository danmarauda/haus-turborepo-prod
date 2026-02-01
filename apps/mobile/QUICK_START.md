# HAUS Mobile - Quick Start Guide

> **App**: @haus/mobile  
> **Framework**: Expo 55 + React Native 0.81 + Expo Router 6  
> **Last Updated**: 2026-02-01

---

## Prerequisites

### Required Software
- **Node.js**: 18+ (LTS recommended)
- **Bun**: 1.1.26+ (`curl -fsSL https://bun.sh/install | bash`)
- **Xcode**: 15+ (for iOS development, macOS only)
- **Android Studio**: Hedgehog+ (for Android development)
- **Git**: Latest

### Optional Tools
- **EAS CLI**: For cloud builds (`bun add -g eas-cli`)
- **Maestro**: For E2E testing (`curl -fsSL https://get.maestro.mobile.dev | bash`)
- **Convex CLI**: For backend development (`bun add -g convex`)

---

## Initial Setup

### 1. Clone & Install

```bash
# Navigate to project root
cd /Users/alias/Desktop/haus-voice-search/_external/haus-turborepo-prod

# Install all dependencies
bun install
```

### 2. Environment Configuration

Create environment file:

```bash
cd apps/mobile
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# Required: Convex backend
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Required: Supabase auth
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: RevenueCat subscriptions
EXPO_PUBLIC_RC_IOS=appl_your_ios_key
EXPO_PUBLIC_RC_ANDROID=goog_your_android_key

# Optional: Stripe payments
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Optional: Sentry error tracking
EXPO_PUBLIC_SENTRY_DSN=https://your-sentry-dsn

# Optional: LiveKit voice
EXPO_PUBLIC_LIVEKIT_URL=wss://your-livekit-server
```

### 3. Convex Backend Setup

```bash
# Navigate to backend package
cd packages/backend

# Install dependencies (if not already done)
bun install

# Start Convex dev server
bun run dev
```

This will:
- Start the Convex dev server
- Deploy schema and functions
- Provide the `EXPO_PUBLIC_CONVEX_URL` (copy from output)

### 4. Prebuild (First Time Only)

```bash
cd apps/mobile

# Generate native iOS/Android projects
bun run prebuild
```

---

## Running the App

### Option 1: Development Build (Recommended)

```bash
# From project root - start mobile only
bun run dev:mobile

# Or from mobile directory
cd apps/mobile && bun run dev
```

Then press:
- `i` - Open iOS simulator
- `a` - Open Android emulator
- `w` - Open web version

### Option 2: Expo Go (Limited)

```bash
cd apps/mobile
bun run dev

# Scan QR code with Expo Go app
```

⚠️ **Note**: Some features (LiveKit, RevenueCat, Stripe) require native modules and won't work in Expo Go.

### Option 3: EAS Build (Production Testing)

```bash
# Build for iOS
bun run build:ios

# Build for Android
bun run build:android

# Build both platforms
bun run build:mobile
```

---

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth routes (login, register, etc.)
│   ├── (tabs)/            # Main tab routes
│   │   └── (haus)/        # HAUS academy sub-routes
│   ├── onboarding/        # Onboarding flow
│   └── _layout.tsx        # Root layout with providers
├── components/            # React components
│   ├── chat/              # Chat UI components
│   ├── voice/             # Voice/LiveKit components
│   ├── memory/            # Memory/context components
│   ├── property/          # Property display
│   ├── search/            # Search & filters
│   ├── academy/           # Academy components
│   ├── ai/                # AI message components
│   └── ui/                # UI utilities
├── hooks/                 # Custom React hooks
├── context/               # React contexts
├── providers/             # State providers
├── lib/                   # Utilities & config
│   ├── storage/           # MMKV storage
│   ├── data/              # Static data
│   └── theme/             # Design tokens
├── services/              # External services
├── types/                 # TypeScript types
├── config/                # App configuration
├── locales/               # i18n translations
└── .maestro/              # E2E test flows
```

---

## Common Commands

### Development
```bash
# Start mobile dev server
bun run dev:mobile

# Start with specific platform
cd apps/mobile && bun run dev:ios
cd apps/mobile && bun run dev:android
cd apps/mobile && bun run dev:web

# Start all apps
bun run dev
```

### Building
```bash
# Type check
cd apps/mobile && bun run typecheck

# Lint
cd apps/mobile && bun run lint

# Build web export
cd apps/mobile && bun run build:web

# Build native (EAS)
cd apps/mobile && bun run build:ios
cd apps/mobile && bun run build:android
```

### Testing
```bash
# Run Maestro tests
cd apps/mobile
maestro test .maestro/smoke-test.yaml

# Run specific test
maestro test .maestro/01-onboarding.yaml
```

### Troubleshooting
```bash
# Clear all caches
bun run clean

# Clean mobile only
cd apps/mobile && bun run clean

# Reset iOS build
cd apps/mobile && rm -rf ios && bun run prebuild

# Reset Android build
cd apps/mobile && rm -rf android && bun run prebuild
```

---

## Feature Configuration

### RevenueCat (Subscriptions)

1. Create account at [revenuecat.com](https://www.revenuecat.com)
2. Add your app and get API keys
3. Configure products in RevenueCat dashboard
4. Add keys to `.env.local`:
   ```bash
   EXPO_PUBLIC_RC_IOS=appl_your_key
   EXPO_PUBLIC_RC_ANDROID=goog_your_key
   EXPO_PUBLIC_RC_SUBSCRIPTION_NAME=premium
   ```

### Stripe (Payments)

1. Create account at [stripe.com](https://stripe.com)
2. Get publishable key from dashboard
3. Add to `.env.local`:
   ```bash
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   ```

### Sentry (Error Tracking)

1. Create account at [sentry.io](https://sentry.io)
2. Create React Native project
3. Get DSN and add to `.env.local`:
   ```bash
   EXPO_PUBLIC_SENTRY_DSN=https://your-dsn
   ```

### LiveKit (Voice)

1. Deploy LiveKit server or use Cloud
2. Get URL and token endpoint
3. Add to `.env.local`:
   ```bash
   EXPO_PUBLIC_LIVEKIT_URL=wss://your-server.livekit.cloud
   ```
4. Implement token endpoint in Convex (see `packages/backend/convex/`)

---

## Development Workflow

### Adding a New Screen

1. Create file in `app/(tabs)/` or appropriate directory:
   ```tsx
   // app/(tabs)/new-screen.tsx
   export default function NewScreen() {
     return <View><Text>New Screen</Text></View>;
   }
   ```

2. Add to tab layout in `app/(tabs)/_layout.tsx` (if tab screen)

3. Run type check:
   ```bash
   cd apps/mobile && bun run typecheck
   ```

### Adding a New Component

1. Create component file in `components/<category>/`
2. Export from `components/<category>/index.ts`
3. Export from `components/index.ts` (if shared)

### Adding a New Hook

1. Create hook file in `hooks/`
2. Export from `hooks/index.ts`:
   ```ts
   // hooks/index.ts
   export { useNewHook } from './useNewHook';
   ```

---

## Troubleshooting

### Build Errors

**Error**: `no member named 'schedule' in 'worklets::WorkletRuntime'`

**Solution**: This is an Expo 55 beta compatibility issue. Options:
1. Use EAS Build: `cd apps/mobile && eas build --platform ios`
2. Downgrade to Expo 54 stable
3. Wait for Expo 55 stable release

### Metro Bundler Issues

```bash
# Clear Metro cache
cd apps/mobile && npx expo start --clear

# Or
rm -rf node_modules/.cache
```

### iOS Build Issues

```bash
# Clean iOS build
cd apps/mobile/ios
rm -rf build Pods Podfile.lock
pod install --repo-update
cd ..
bun run ios
```

### Android Build Issues

```bash
# Clean Android build
cd apps/mobile/android
./gradlew clean
cd ..
bun run android
```

### Dependency Issues

```bash
# Reset all dependencies
bun run clean
bun install
cd apps/mobile && bun run prebuild
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_CONVEX_URL` | ✅ Yes | Convex backend URL |
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anon key |
| `EXPO_PUBLIC_RC_IOS` | ❌ No | RevenueCat iOS API key |
| `EXPO_PUBLIC_RC_ANDROID` | ❌ No | RevenueCat Android API key |
| `EXPO_PUBLIC_RC_SUBSCRIPTION_NAME` | ❌ No | Subscription product name |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ❌ No | Stripe publishable key |
| `EXPO_PUBLIC_SENTRY_DSN` | ❌ No | Sentry error tracking DSN |
| `EXPO_PUBLIC_JWT_SECRET` | ⚠️ Dev Only | JWT signing secret |
| `EXPO_PUBLIC_LIVEKIT_URL` | ❌ No | LiveKit server URL |

---

## Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev)
- [Convex](https://docs.convex.dev)
- [NativeWind](https://www.nativewind.dev)

### Project Files
- `MIGRATION_STATUS.md` - Detailed migration report
- `PARITY.md` - Feature parity analysis
- `AGENTS.md` - Project conventions

---

## Support

For issues or questions:
1. Check `MIGRATION_STATUS.md` for known issues
2. Review `PARITY.md` for feature status
3. Check logs with `bun run dev:mobile` (verbose mode)
4. File issues in project repository

---

**Happy coding! 🚀**
