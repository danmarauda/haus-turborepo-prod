import 'react-native-reanimated';
import '../global.css';
import '@/config/i18n';

import React, { useEffect } from 'react';
import { ConvexProvider } from 'convex/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppState, View, Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';

import { convex } from '@/lib/convex';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { queryClient, restoreQueryCache, persistQueryCache } from '@/lib/queryClient';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { AuthProvider } from '@/services/auth';
import { Toaster } from 'sonner-native';
import { prefs } from '@/lib/storage';
import { RevenueCatProvider } from '@/context/RevenueCatContext';
import ExpoStripeProvider from '@/context/StripeContext';

// NEW: Migration and new providers
import { runStorageMigration } from '@/lib/storage/migration';
import { FavoritesProvider } from '@/providers/FavoritesProvider';
import { RealtimeFiltersProvider } from '@/providers/RealtimeFiltersProvider';

// Initialize Sentry (disabled if no DSN configured)
const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    sendDefaultPii: true,
    integrations: [Sentry.feedbackIntegration()],
    tracesSampleRate: 1.0,
  });
}

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

// Wrapper component that applies theme variables
function ThemedLayout({ children }: { children: React.ReactNode }) {
  const { isDark, themeVars } = useTheme();

  return (
    <View style={[{ flex: 1 }, themeVars]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0F0F0F' : '#FFFFFF'}
        translucent={false}
      />
      {children}
      <Toaster />
    </View>
  );
}

// Component to initialize MMKV persistence and migration
function AppInitializer({ children }: { children: React.ReactNode }) {
  const { isConnected } = useNetworkStatus();

  useEffect(() => {
    // Run AsyncStorage → MMKV migration on startup
    runStorageMigration().then((results) => {
      if (results.themeMigrated || results.favoritesMigrated.length > 0) {
        console.log('✅ Storage migration completed:', results);
      }
    });

    // Restore React Query cache on startup
    if (sentryDsn) {
      Sentry.captureMessage('🚀 App initialization - Cache restoration');
    }
    console.log('🚀 App initialization - Cache restoration');
    restoreQueryCache();
  }, []);

  useEffect(() => {
    // Save cache periodically when online
    if (!isConnected) return;

    console.log('📡 Online - Periodic backup enabled');
    const interval = setInterval(() => {
      persistQueryCache();
    }, 60000); // Every minute when online

    return () => {
      console.log('📡 Offline - Periodic backup disabled');
      clearInterval(interval);
    };
  }, [isConnected]);

  useEffect(() => {
    // Save cache when app goes to background or closes
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('💾 App backgrounded - Cache save');
        persistQueryCache();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Final save when component unmounts
    return () => {
      console.log('🔚 App closing - Final save');
      persistQueryCache();
      subscription?.remove();
    };
  }, []);

  return <ThemedLayout>{children}</ThemedLayout>;
}

const RootLayoutContent = () => {
  const [fontsLoaded] = useFonts({
    // Add custom fonts here if needed
    // 'CustomFont': require('../assets/fonts/CustomFont.ttf'),
  });

  // Check onboarding status
  const hasCompletedOnboarding = prefs.getBoolean('onboarding_complete', false);

  if (!fontsLoaded) {
    return null;
  }

  // Determine initial route
  const initialRouteName = hasCompletedOnboarding ? '(tabs)' : 'onboarding';

  return (
    <AppInitializer>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 150,
        }}
        initialRouteName={initialRouteName}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="property/[id]"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Property Details',
          }}
        />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
    </AppInitializer>
  );
};

// Provider hierarchy:
// GestureHandler → SafeArea → Theme → Favorites → RealtimeFilters → QueryClient → Convex → Auth → RevenueCat → Stripe

// Wrap with Sentry if configured, otherwise plain export
export default Sentry.wrap
  ? function RootLayout() {
      return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <ThemeProvider>
              <FavoritesProvider>
                <RealtimeFiltersProvider>
                  <QueryClientProvider client={queryClient}>
                    <ConvexProvider client={convex}>
                      <AuthProvider>
                        <RevenueCatProvider>
                          <ExpoStripeProvider>
                            <RootLayoutContent />
                          </ExpoStripeProvider>
                        </RevenueCatProvider>
                      </AuthProvider>
                    </ConvexProvider>
                  </QueryClientProvider>
                </RealtimeFiltersProvider>
              </FavoritesProvider>
            </ThemeProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      );
    }
  : function RootLayout() {
      return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <ThemeProvider>
              <FavoritesProvider>
                <RealtimeFiltersProvider>
                  <QueryClientProvider client={queryClient}>
                    <ConvexProvider client={convex}>
                      <AuthProvider>
                        <RevenueCatProvider>
                          <ExpoStripeProvider>
                            <RootLayoutContent />
                          </ExpoStripeProvider>
                        </RevenueCatProvider>
                      </AuthProvider>
                    </ConvexProvider>
                  </QueryClientProvider>
                </RealtimeFiltersProvider>
              </FavoritesProvider>
            </ThemeProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      );
    };
