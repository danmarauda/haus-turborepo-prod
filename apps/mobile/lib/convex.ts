import { ConvexReactClient } from 'convex/react';
import Constants from 'expo-constants';

// Get Convex URL from Expo config extra or fallback to default
// Configure in app.json under expo.extra.convexUrl or use EAS environment variables
const convexUrl = Constants.expoConfig?.extra?.convexUrl as string ||
  'https://scrupulous-warbler-611.convex.cloud';

export const convex = new ConvexReactClient(convexUrl);
