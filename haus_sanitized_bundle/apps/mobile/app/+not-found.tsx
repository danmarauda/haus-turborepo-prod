import { Link, Stack } from 'expo-router';
import { View, Text, Pressable } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-4 bg-white">
        <Text className="text-2xl font-bold mb-2">Page not found</Text>
        <Text className="text-muted-foreground text-center mb-6">
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Link href="/" asChild>
          <Pressable className="bg-primary px-6 py-3 rounded-xl">
            <Text className="text-primary-foreground font-semibold">
              Go to Home
            </Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}
