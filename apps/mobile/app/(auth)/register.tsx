import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    // TODO: Implement Convex auth
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 1000);
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

            {/* Form */}
            <View className="gap-4">
              {/* Name */}
              <View>
                <Text className="text-sm font-medium mb-2">Full Name</Text>
                <View className="flex-row items-center bg-muted rounded-xl px-4 py-3">
                  <User size={20} color="#666" />
                  <TextInput
                    className="flex-1 ml-3 text-base"
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

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
                    placeholder="Create a password"
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
                <Text className="text-muted-foreground text-sm mt-2">
                  Must be at least 8 characters
                </Text>
              </View>

              {/* Terms */}
              <Text className="text-muted-foreground text-sm">
                By creating an account, you agree to our{' '}
                <Text className="text-primary">Terms of Service</Text> and{' '}
                <Text className="text-primary">Privacy Policy</Text>
              </Text>

              {/* Sign Up Button */}
              <Pressable
                onPress={handleRegister}
                disabled={isLoading}
                className={`bg-primary py-4 rounded-xl mt-4 ${isLoading ? 'opacity-50' : ''}`}
              >
                <Text className="text-primary-foreground font-semibold text-center text-base">
                  {isLoading ? 'Creating account...' : 'Create Account'}
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
