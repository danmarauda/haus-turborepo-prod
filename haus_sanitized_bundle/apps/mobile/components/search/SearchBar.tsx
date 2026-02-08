/**
 * SearchBar - Search input with focus states
 * 
 * NativeWind styling with focus state handling
 * Search icon from lucide-react-native
 */

import { Search, X } from "lucide-react-native";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { cn } from "../../lib/utils";

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  className?: string;
  autoFocus?: boolean;
  testID?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search properties, suburbs, or postcodes",
  onSubmit,
  className,
  autoFocus = false,
  testID = "search-input",
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText("");
  };

  return (
    <View
      className={cn(
        "flex-row items-center rounded-lg border bg-card px-3",
        isFocused 
          ? "border-primary ring-2 ring-primary/20" 
          : "border-border",
        className
      )}
      style={{ height: 44 }}
    >
      <Search 
        size={18} 
        className={cn(
          "text-muted-foreground",
          isFocused && "text-primary"
        )}
      />
      <TextInput
        className="ml-2 h-full flex-1 text-base text-foreground"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        testID={testID}
        autoFocus={autoFocus}
      />
      {value.length > 0 && (
        <TouchableOpacity 
          onPress={handleClear} 
          className="p-1"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <View className="h-5 w-5 items-center justify-center rounded-full bg-muted">
            <X size={12} className="text-muted-foreground" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default SearchBar;
