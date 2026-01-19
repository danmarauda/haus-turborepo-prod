import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Phone,
  MessageSquare,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // TODO: Fetch property data from Convex
  const property = {
    id,
    title: 'Modern Downtown Apartment',
    price: 485000,
    address: '123 Main Street, Downtown',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1850,
    yearBuilt: 2020,
    description:
      'Beautiful modern apartment in the heart of downtown. Features high ceilings, floor-to-ceiling windows, and premium finishes throughout. Walking distance to restaurants, shops, and public transit.',
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Image Placeholder */}
        <View
          style={{ width, height: width * 0.75 }}
          className="bg-muted items-center justify-center"
        >
          <Text className="text-muted-foreground">Property Images</Text>
        </View>

        {/* Header Actions */}
        <View className="absolute top-12 left-0 right-0 px-4 flex-row justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/90 rounded-full items-center justify-center"
          >
            <ArrowLeft size={20} color="#000" />
          </Pressable>
          <View className="flex-row gap-2">
            <Pressable className="w-10 h-10 bg-white/90 rounded-full items-center justify-center">
              <Share2 size={20} color="#000" />
            </Pressable>
            <Pressable className="w-10 h-10 bg-white/90 rounded-full items-center justify-center">
              <Heart size={20} color="#000" />
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 py-6">
          {/* Price */}
          <Text className="text-3xl font-bold">
            ${property.price.toLocaleString()}
          </Text>

          {/* Title */}
          <Text className="text-xl font-semibold mt-2">{property.title}</Text>

          {/* Address */}
          <View className="flex-row items-center mt-2">
            <MapPin size={16} color="#666" />
            <Text className="ml-2 text-muted-foreground">{property.address}</Text>
          </View>

          {/* Stats */}
          <View className="flex-row mt-6 gap-4">
            <View className="flex-1 bg-muted p-4 rounded-xl items-center">
              <Bed size={24} color="#666" />
              <Text className="font-semibold mt-2">{property.bedrooms}</Text>
              <Text className="text-muted-foreground text-sm">Bedrooms</Text>
            </View>
            <View className="flex-1 bg-muted p-4 rounded-xl items-center">
              <Bath size={24} color="#666" />
              <Text className="font-semibold mt-2">{property.bathrooms}</Text>
              <Text className="text-muted-foreground text-sm">Bathrooms</Text>
            </View>
            <View className="flex-1 bg-muted p-4 rounded-xl items-center">
              <Square size={24} color="#666" />
              <Text className="font-semibold mt-2">{property.sqft}</Text>
              <Text className="text-muted-foreground text-sm">Sq Ft</Text>
            </View>
          </View>

          {/* Year Built */}
          <View className="flex-row items-center mt-4 bg-muted p-4 rounded-xl">
            <Calendar size={20} color="#666" />
            <Text className="ml-3 text-muted-foreground">Built in </Text>
            <Text className="font-semibold">{property.yearBuilt}</Text>
          </View>

          {/* Description */}
          <View className="mt-6">
            <Text className="text-lg font-semibold mb-2">Description</Text>
            <Text className="text-muted-foreground leading-6">
              {property.description}
            </Text>
          </View>

          {/* Features */}
          <View className="mt-6">
            <Text className="text-lg font-semibold mb-3">Features</Text>
            <View className="flex-row flex-wrap gap-2">
              {['Central AC', 'Parking', 'Gym', 'Pool', 'Balcony', 'Pet Friendly'].map(
                (feature) => (
                  <View
                    key={feature}
                    className="bg-secondary px-3 py-2 rounded-full border border-border"
                  >
                    <Text className="text-sm">{feature}</Text>
                  </View>
                )
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <SafeAreaView edges={['bottom']} className="bg-white border-t border-border">
        <View className="flex-row gap-3 px-4 py-3">
          <Pressable className="flex-1 bg-secondary py-4 rounded-xl flex-row items-center justify-center border border-border">
            <MessageSquare size={20} color="#000" />
            <Text className="ml-2 font-semibold">Message</Text>
          </Pressable>
          <Pressable className="flex-1 bg-primary py-4 rounded-xl flex-row items-center justify-center">
            <Phone size={20} color="#fff" />
            <Text className="ml-2 font-semibold text-primary-foreground">
              Call Agent
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
