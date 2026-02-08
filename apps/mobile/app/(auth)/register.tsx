import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/services/auth';

export default function RegisterScreen() {
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
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-4 pt-4">
            <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
              <ArrowLeft size={24} color="#000" />
            </Pressable>
          </View>

          <View className="flex-1 px-6 pt-8 pb-8">
            {/* Title */}
            <Text className="text-3xl font-bold">Create account</Text>
            <Text className="text-muted-foreground mt-2 mb-8">
              Join Haus to find your perfect property
            </Text>

            {/* Google Sign In */}
            <Pressable
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              className={`bg-white border border-border py-4 rounded-xl flex-row items-center justify-center ${isLoading ? 'opacity-50' : ''}`}
            >
              <Text className="text-lg mr-2">G</Text>
              <Text className="font-semibold">
                {isLoading ? 'Creating account...' : 'Continue with Google'}
              </Text>
            </Pressable>

            {/* Terms */}
            <View className="mt-6 px-4">
              <Text className="text-center text-sm text-muted-foreground">
                By creating an account, you agree to our{' '}
                <Text className="text-primary">Terms of Service</Text> and{' '}
                <Text className="text-primary">Privacy Policy</Text>
              </Text>
            </View>

            {/* Sign In Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-muted-foreground">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text className="text-primary font-semibold">Sign in</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
