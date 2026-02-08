import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Link } from 'expo-router';
import { Home } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

export default function WelcomeScreen() {
  const { themeVars } = useTheme();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ minHeight: '100%' }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="flex-1 px-6 pb-8 pt-20">
          <View className="mb-16 items-center">
            <View className="mb-8 h-24 w-24 items-center justify-center rounded-3xl bg-primary/20">
              <Home size={48} color={themeVars.primary} strokeWidth={2} />
            </View>

            <View className="mb-3 items-center">
              <View className="h-1 w-16 rounded-full bg-primary mb-4" />
              <Text className="text-center text-4xl font-bold tracking-tight text-foreground">
                HAUS
              </Text>
            </View>

            <Text className="max-w-xs text-center text-lg text-muted-foreground">
              AI-Native Property Intelligence
            </Text>
            <Text className="max-w-xs text-center text-base text-muted-foreground mt-2">
              Find your perfect property with AI-powered search and insights
            </Text>
          </View>
        </View>

        {/* Features Section */}
        <View className="gap-4 px-6 pb-8">
          <View className="flex-row items-center gap-4 rounded-2xl bg-card p-4 border border-border">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Text className="text-2xl">🔍</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-foreground">Voice Search</Text>
              <Text className="text-sm text-muted-foreground">Describe your ideal property naturally</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4 rounded-2xl bg-card p-4 border border-border">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Text className="text-2xl">🤖</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-foreground">AI Agents</Text>
              <Text className="text-sm text-muted-foreground">Personalized property recommendations</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4 rounded-2xl bg-card p-4 border border-border">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Text className="text-2xl">📊</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-foreground">Market Analytics</Text>
              <Text className="text-sm text-muted-foreground">Real-time property insights</Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View className="gap-4 px-6 pb-12">
          {/* Get Started Button */}
          <Link href="/register" asChild>
            <TouchableOpacity
              className="items-center justify-center rounded-2xl bg-primary py-4"
              activeOpacity={0.8}
            >
              <Text className="font-semibold text-primary-foreground text-base">
                Get Started
              </Text>
            </TouchableOpacity>
          </Link>

          {/* Sign In Link */}
          <View className="items-center">
            <Text className="text-muted-foreground text-sm">
              Already have an account?{' '}
            </Text>
            <Link href="/login" asChild>
              <TouchableOpacity activeOpacity={0.7} className="py-2">
                <Text className="text-primary text-base font-semibold">
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
