import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, MapPin, Phone, Mail } from 'lucide-react-native';

export default function AgencyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-2xl font-bold">Agency</Text>
          <Text className="text-muted-foreground mt-1">
            Find trusted real estate agents
          </Text>
        </View>

        {/* Search Agents */}
        <View className="px-4 mb-6">
          <Pressable className="bg-muted p-4 rounded-xl">
            <Text className="text-muted-foreground">Search agents...</Text>
          </Pressable>
        </View>

        {/* Featured Agents */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold mb-3">Featured Agents</Text>
          <View className="gap-4">
            {/* Agent Card */}
            {[1, 2, 3].map((i) => (
              <Pressable
                key={i}
                className="bg-white border border-border rounded-xl p-4"
              >
                <View className="flex-row">
                  <View className="w-16 h-16 bg-muted rounded-full items-center justify-center">
                    <Text className="text-2xl">👤</Text>
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="font-semibold text-lg">Agent Name {i}</Text>
                    <View className="flex-row items-center mt-1">
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      <Text className="ml-1 text-sm text-muted-foreground">
                        4.9 (124 reviews)
                      </Text>
                    </View>
                    <View className="flex-row items-center mt-1">
                      <MapPin size={14} color="#666" />
                      <Text className="ml-1 text-sm text-muted-foreground">
                        Downtown Area
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="flex-row gap-3 mt-4">
                  <Pressable className="flex-1 bg-primary py-2 rounded-lg flex-row items-center justify-center">
                    <Phone size={16} color="#fff" />
                    <Text className="ml-2 text-primary-foreground font-medium">
                      Call
                    </Text>
                  </Pressable>
                  <Pressable className="flex-1 bg-secondary py-2 rounded-lg flex-row items-center justify-center border border-border">
                    <Mail size={16} color="#000" />
                    <Text className="ml-2 text-secondary-foreground font-medium">
                      Email
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Services */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold mb-3">Our Services</Text>
          <View className="gap-3">
            <View className="bg-muted p-4 rounded-xl">
              <Text className="font-semibold">Property Valuation</Text>
              <Text className="text-muted-foreground text-sm mt-1">
                Get accurate market value estimates
              </Text>
            </View>
            <View className="bg-muted p-4 rounded-xl">
              <Text className="font-semibold">Legal Assistance</Text>
              <Text className="text-muted-foreground text-sm mt-1">
                Expert help with contracts and paperwork
              </Text>
            </View>
            <View className="bg-muted p-4 rounded-xl">
              <Text className="font-semibold">Mortgage Consulting</Text>
              <Text className="text-muted-foreground text-sm mt-1">
                Find the best financing options
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
