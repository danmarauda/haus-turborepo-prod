import { View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle, isLoading } = useAuth();

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-4 pt-4">
          <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
            <ArrowLeft size={24} color="#000" />
          </Pressable>
        </View>

        <View className="flex-1 px-6 pt-8">
          {/* Title */}
          <Text className="text-3xl font-bold">Welcome back</Text>
          <Text className="text-muted-foreground mt-2 mb-8">
            Sign in to continue to Haus
          </Text>

          {/* Google Sign In */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            className={`bg-white border border-border py-4 rounded-xl flex-row items-center justify-center ${isLoading ? 'opacity-50' : ''}`}
          >
            <Text className="text-lg mr-2">G</Text>
            <Text className="font-semibold">
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </Pressable>

          {/* Info text */}
          <View className="mt-8 px-4">
            <Text className="text-center text-sm text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
