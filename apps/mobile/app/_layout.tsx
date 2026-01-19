import '../global.css';

import { ConvexProvider } from 'convex/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { convex } from '@/lib/convex';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ConvexProvider client={convex}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
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
          </Stack>
          <StatusBar style="auto" />
        </ConvexProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
