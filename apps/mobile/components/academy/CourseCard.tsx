import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Clock, Star } from "lucide-react-native";
import type { Course } from "@/mocks/academy";

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}

export function CourseCard({ course, onPress }: CourseCardProps) {
  return (
    <TouchableOpacity
      className="flex-row bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: course.thumbnailUrl }}
        className="w-24 h-24"
        contentFit="cover"
      />
      <View className="flex-1 p-3 justify-center">
        <View className="flex-row items-center gap-1.5 mb-1">
          {course.isNew && (
            <View className="bg-emerald-500 px-1.5 py-0.5 rounded">
              <Text className="text-white text-[9px]">NEW</Text>
            </View>
          )}
          <View className="flex-row items-center gap-0.5">
            <Star color="#fbbf24" size={12} fill="#fbbf24" />
            <Text className="text-amber-400 text-xs">{course.rating}</Text>
          </View>
        </View>
        <Text className="text-sm text-white mb-0.5" numberOfLines={2}>
          {course.title}
        </Text>
        <Text className="text-xs text-neutral-500 mb-1.5">
          {course.instructor.name}
        </Text>
        <View className="flex-row items-center gap-1">
          <Clock color="#737373" size={12} />
          <Text className="text-xs text-neutral-500">
            {Math.floor(course.duration / 60)}h {course.duration % 60}m
          </Text>
          <Text className="text-neutral-600 text-xs">·</Text>
          <Text className="text-xs text-neutral-500">
            {course.lessonsCount} lessons
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
