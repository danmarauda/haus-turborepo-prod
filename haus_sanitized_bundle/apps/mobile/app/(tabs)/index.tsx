import { Link } from 'expo-router';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-3xl font-bold text-foreground">Haus</Text>
          <Text className="text-muted-foreground mt-1">
            Find your perfect property
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            <Link href="/search" asChild>
              <Pressable className="flex-1 bg-primary p-4 rounded-xl">
                <Text className="text-primary-foreground font-semibold">
                  Search Properties
                </Text>
                <Text className="text-primary-foreground/70 text-sm mt-1">
                  Browse listings
                </Text>
              </Pressable>
            </Link>
            <Link href="/market" asChild>
              <Pressable className="flex-1 bg-secondary p-4 rounded-xl border border-border">
                <Text className="text-secondary-foreground font-semibold">
                  Marketplace
                </Text>
                <Text className="text-muted-foreground text-sm mt-1">
                  Buy & Sell
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {/* Featured Section */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold mb-3">Featured Properties</Text>
          <View className="bg-muted rounded-xl p-4">
            <Text className="text-muted-foreground text-center py-8">
              Featured properties will appear here
            </Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold mb-3">Recent Activity</Text>
          <View className="bg-muted rounded-xl p-4">
            <Text className="text-muted-foreground text-center py-8">
              Your recent activity will appear here
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
