import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function HausLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: "#0a0a0a",
        },
        headerTintColor: "#ffffff",
        contentStyle: {
          backgroundColor: "#0a0a0a",
        },
        // Enable native zoom transition on iOS
        ...(Platform.OS === "ios" && {
          animation: "default",
        }),
      }}
    >
      <Stack.Screen name="academy" />
      <Stack.Screen name="courses" />
      <Stack.Screen name="course/[id]" />
      <Stack.Screen name="lesson/[courseId]/[lessonId]" />
      <Stack.Screen name="path/[id]" />
      <Stack.Screen name="state/[id]" />
      <Stack.Screen name="state-selector" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="affordability" />
      <Stack.Screen name="vault" />
      <Stack.Screen name="preapproval" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="filters" />
      <Stack.Screen name="request-intro" />
      <Stack.Screen name="upload" />
      <Stack.Screen name="review-submit" />
    </Stack>
  );
}
