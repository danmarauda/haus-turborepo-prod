import 'react-native-reanimated';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 300,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
