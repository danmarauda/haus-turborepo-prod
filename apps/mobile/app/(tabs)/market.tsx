import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react-native';

export default function MarketScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-2xl font-bold">Market</Text>
          <Text className="text-muted-foreground mt-1">
            Real estate market insights
          </Text>
        </View>

        {/* Market Overview */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold mb-3">Market Overview</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-green-50 p-4 rounded-xl border border-green-200">
              <View className="flex-row items-center">
                <TrendingUp size={20} color="#16a34a" />
                <Text className="ml-2 text-green-700 font-semibold">+5.2%</Text>
              </View>
              <Text className="text-green-600 text-sm mt-1">
                Avg. Price Change
              </Text>
            </View>
            <View className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-200">
              <View className="flex-row items-center">
                <DollarSign size={20} color="#2563eb" />
                <Text className="ml-2 text-blue-700 font-semibold">$485K</Text>
              </View>
              <Text className="text-blue-600 text-sm mt-1">Median Price</Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold mb-3">Categories</Text>
          <View className="gap-3">
            <Pressable className="bg-muted p-4 rounded-xl flex-row justify-between items-center">
              <View>
                <Text className="font-semibold">Residential</Text>
                <Text className="text-muted-foreground text-sm">
                  Houses, Apartments, Condos
                </Text>
              </View>
              <Text className="text-primary font-medium">Browse</Text>
            </Pressable>
            <Pressable className="bg-muted p-4 rounded-xl flex-row justify-between items-center">
              <View>
                <Text className="font-semibold">Commercial</Text>
                <Text className="text-muted-foreground text-sm">
                  Office, Retail, Industrial
                </Text>
              </View>
              <Text className="text-primary font-medium">Browse</Text>
            </Pressable>
            <Pressable className="bg-muted p-4 rounded-xl flex-row justify-between items-center">
              <View>
                <Text className="font-semibold">Land</Text>
                <Text className="text-muted-foreground text-sm">
                  Vacant, Agricultural, Development
                </Text>
              </View>
              <Text className="text-primary font-medium">Browse</Text>
            </Pressable>
          </View>
        </View>

        {/* Trending */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold mb-3">Trending Areas</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {['Downtown', 'Midtown', 'Suburbs', 'Waterfront', 'Historic'].map(
              (area) => (
                <Pressable
                  key={area}
                  className="bg-secondary px-4 py-3 rounded-xl border border-border"
                >
                  <Text className="font-medium">{area}</Text>
                  <Text className="text-muted-foreground text-sm">
                    24 listings
                  </Text>
                </Pressable>
              )
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
