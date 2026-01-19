import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon, SlidersHorizontal } from 'lucide-react-native';

type PropertyType = 'all' | 'house' | 'apartment' | 'condo' | 'land';

const propertyTypes: { label: string; value: PropertyType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Houses', value: 'house' },
  { label: 'Apartments', value: 'apartment' },
  { label: 'Condos', value: 'condo' },
  { label: 'Land', value: 'land' },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PropertyType>('all');

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold">Search Properties</Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3">
        <View className="flex-row items-center bg-muted rounded-xl px-4 py-3">
          <SearchIcon size={20} color="#666" />
          <TextInput
            className="flex-1 ml-3 text-base"
            placeholder="Search by location, address..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <Pressable className="ml-2 p-2 bg-primary rounded-lg">
            <SlidersHorizontal size={18} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Property Type Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2"
        contentContainerStyle={{ gap: 8 }}
      >
        {propertyTypes.map((type) => (
          <Pressable
            key={type.value}
            onPress={() => setSelectedType(type.value)}
            className={`px-4 py-2 rounded-full ${
              selectedType === type.value
                ? 'bg-primary'
                : 'bg-muted border border-border'
            }`}
          >
            <Text
              className={`font-medium ${
                selectedType === type.value
                  ? 'text-primary-foreground'
                  : 'text-foreground'
              }`}
            >
              {type.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Results */}
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-muted-foreground">0 properties found</Text>
          <Pressable>
            <Text className="text-primary font-medium">Sort</Text>
          </Pressable>
        </View>

        {/* Placeholder for results */}
        <View className="flex-1 items-center justify-center">
          <SearchIcon size={48} color="#ccc" />
          <Text className="text-muted-foreground mt-4 text-center">
            Search for properties by location,{'\n'}address, or use filters
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
