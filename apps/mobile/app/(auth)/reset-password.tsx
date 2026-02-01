import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { Link, useRouter, Alert } from 'expo-router';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { themeVars } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement Convex password reset
      // await resetPassword(email);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setEmailSent(true);
      Alert.alert(
        'Check Your Email',
        'We\'ve sent a password reset link to your email address.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Reset password error:', error);
      Alert.alert('Error', error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pb-6 pt-4">
            <Pressable
              className="w-10 h-10 items-center justify-center rounded-2xl bg-card border border-border"
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={themeVars.foreground} />
            </Pressable>
          </View>

          {/* Content */}
          <View className="flex-1 px-6">
            {/* Icon */}
            <View className="items-center mb-8">
              <View className="items-center justify-center rounded-3xl bg-primary/10 h-20 w-20">
                <Mail size={40} color={themeVars.primary} strokeWidth={2} />
              </View>
            </View>

            {/* Title */}
            <Text className="text-center text-foreground text-3xl font-bold mb-3">
              Reset Password
            </Text>
            <Text className="text-center text-muted-foreground text-base leading-6 mb-10">
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            {/* Form */}
            <View className="mb-8">
              <View className="mb-6 flex-row items-center rounded-2xl border border-border bg-card px-4">
                <Mail size={20} color={themeVars.primary} strokeWidth={2} />
                <TextInput
                  className="flex-1 text-foreground min-h-[50px] py-3 px-3 text-base"
                  placeholder="Enter your email"
                  placeholderTextColor={themeVars['muted-foreground']}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading && !emailSent}
                />
              </View>

              <TouchableOpacity
                className={`items-center justify-center rounded-2xl min-h-[50px] py-3 px-4 ${
                  loading || !email.trim() || emailSent ? 'bg-muted' : 'bg-primary'
                }`}
                onPress={handleResetPassword}
                disabled={loading || !email.trim() || emailSent}
                activeOpacity={0.8}
              >
                <Text
                  className={`text-base font-semibold ${
                    loading || !email.trim() || emailSent
                      ? 'text-muted-foreground'
                      : 'text-primary-foreground'
                  }`}
                >
                  {loading
                    ? 'Sending...'
                    : emailSent
                      ? 'Email Sent'
                      : 'Send Reset Link'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Success Message */}
            {emailSent && (
              <View className="mb-6 flex-row items-center rounded-2xl bg-green-500/10 p-4 border border-green-500/20">
                <CheckCircle size={24} color="#10B981" strokeWidth={2} />
                <Text className="ml-3 flex-1 text-green-600 text-sm leading-5">
                  Check your email for the reset link
                </Text>
              </View>
            )}

            {/* Back to Login */}
            <View className="items-center mt-6">
              <Text className="text-muted-foreground text-sm">
                Remember your password?
              </Text>
              <Link href="/login" asChild>
                <TouchableOpacity activeOpacity={0.7} className="mt-2 py-2">
                  <Text className="text-primary text-base font-semibold">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
