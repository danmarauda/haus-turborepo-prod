import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import {
  User,
  Heart,
  Clock,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();

  const menuItems = [
    { icon: Heart, label: 'Saved Properties', href: '/saved' },
    { icon: Clock, label: 'Viewing History', href: '/history' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: Settings, label: 'Settings', href: '/(tabs)/settings' },
    { icon: HelpCircle, label: 'Help & Support', href: '/support' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-2xl font-bold">Profile</Text>
        </View>

        {/* User Card */}
        <View className="px-4 mb-6">
          <Pressable className="bg-muted rounded-xl p-4 flex-row items-center">
            <View className="w-16 h-16 bg-primary rounded-full items-center justify-center">
              <User size={32} color="#fff" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-lg font-semibold">Guest User</Text>
              <Text className="text-muted-foreground">
                Sign in to access all features
              </Text>
            </View>
            <ChevronRight size={20} color="#666" />
          </Pressable>
        </View>

        {/* Sign In CTA */}
        <View className="px-4 mb-6">
          <Link href="/(auth)/login" asChild>
            <Pressable className="bg-primary p-4 rounded-xl">
              <Text className="text-primary-foreground font-semibold text-center">
                Sign In
              </Text>
            </Pressable>
          </Link>
          <Link href="/(auth)/register" asChild>
            <Pressable className="bg-secondary p-4 rounded-xl mt-3 border border-border">
              <Text className="text-secondary-foreground font-semibold text-center">
                Create Account
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* Menu Items */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold mb-3">Account</Text>
          <View className="bg-muted rounded-xl overflow-hidden">
            {menuItems.map((item, index) => (
              <Pressable
                key={item.label}
                className={`flex-row items-center p-4 ${
                  index < menuItems.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <item.icon size={20} color="#666" />
                <Text className="flex-1 ml-3 font-medium">{item.label}</Text>
                <ChevronRight size={20} color="#999" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <View className="px-4 mb-8">
          <Pressable className="flex-row items-center justify-center p-4 bg-destructive/10 rounded-xl">
            <LogOut size={20} color="#dc2626" />
            <Text className="ml-2 text-destructive font-medium">Sign Out</Text>
          </Pressable>
        </View>

        {/* App Info */}
        <View className="px-4 mb-8 items-center">
          <Text className="text-muted-foreground text-sm">Haus v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
