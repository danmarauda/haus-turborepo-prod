import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '@/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      return;
    }

    await signIn({ email, password });
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

          {/* Form */}
          <View className="gap-4">
            {/* Email */}
            <View>
              <Text className="text-sm font-medium mb-2">Email</Text>
              <View className="flex-row items-center bg-muted rounded-xl px-4 py-3">
                <Mail size={20} color="#666" />
                <TextInput
                  className="flex-1 ml-3 text-base"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text className="text-sm font-medium mb-2">Password</Text>
              <View className="flex-row items-center bg-muted rounded-xl px-4 py-3">
                <Lock size={20} color="#666" />
                <TextInput
                  className="flex-1 ml-3 text-base"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#999"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#666" />
                  ) : (
                    <Eye size={20} color="#666" />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Forgot Password */}
            <Link href="/(auth)/reset-password" asChild>
              <Pressable className="self-end">
                <Text className="text-primary font-medium">Forgot password?</Text>
              </Pressable>
            </Link>

            {/* Sign In Button */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              className={`bg-primary py-4 rounded-xl mt-4 ${isLoading ? 'opacity-50' : ''}`}
            >
              <Text className="text-primary-foreground font-semibold text-center text-base">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </Pressable>

            {/* Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-border" />
              <Text className="mx-4 text-muted-foreground">or</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Google Sign In */}
            <Pressable className="bg-white border border-border py-4 rounded-xl flex-row items-center justify-center">
              <Text className="text-lg mr-2">G</Text>
              <Text className="font-semibold">Continue with Google</Text>
            </Pressable>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-muted-foreground">Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text className="text-primary font-semibold">Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
