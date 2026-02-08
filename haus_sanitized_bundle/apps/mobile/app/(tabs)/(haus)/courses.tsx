import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Search, Clock, Star, ChevronLeft, BookOpen, Users } from "lucide-react-native";
import { courses, Course } from "@/lib/data/academy";
import { cn } from "@/lib/utils";

type CategoryFilter = "all" | "first-home" | "investor" | "finance" | "market" | "legal";
type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";

export default function CoursesScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");

  const categories: { key: CategoryFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "first-home", label: "First Home" },
    { key: "investor", label: "Investor" },
    { key: "finance", label: "Finance" },
    { key: "market", label: "Market" },
    { key: "legal", label: "Legal" },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || course.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "#10b981";
      case "intermediate":
        return "#f59e0b";
      case "advanced":
        return "#ef4444";
      default:
        return "#737373";
    }
  };

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-neutral-900 items-center justify-center">
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text className="text-lg text-white">All Courses</Text>
        <View className="w-10" />
      </View>

      {/* Search */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-neutral-900 rounded-xl border border-neutral-800 px-4 gap-3">
          <Search color="#737373" size={18} />
          <TextInput
            className="flex-1 h-11 text-white text-base"
            placeholder="Search courses..."
            placeholderTextColor="#737373"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-5 gap-2"
        className="max-h-11 mb-4"
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            className={cn(
              "px-4 py-2 rounded-full border",
              categoryFilter === cat.key
                ? "bg-sky-500 border-sky-400"
                : "bg-neutral-900 border-neutral-800"
            )}
            onPress={() => setCategoryFilter(cat.key)}
          >
            <Text
              className={cn(
                "text-sm",
                categoryFilter === cat.key ? "text-white" : "text-neutral-400"
              )}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Course List */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 gap-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm text-neutral-500">{filteredCourses.length} courses available</Text>

        {filteredCourses.map((course) => (
          <CourseListCard key={course.id} course={course} getDifficultyColor={getDifficultyColor} />
        ))}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}

function CourseListCard({
  course,
  getDifficultyColor,
}: {
  course: Course;
  getDifficultyColor: (d: string) => string;
}) {
  return (
    <TouchableOpacity
      className="rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800"
      onPress={() => router.push(`/(tabs)/(haus)/course/${course.id}` as any)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: course.thumbnailUrl }} className="w-full h-40" contentFit="cover" />
      <View className="absolute top-0 left-0 right-0 h-40 bg-black/30" />

      <View className="relative">
        {/* Badges */}
        <View className="absolute -top-36 left-3 flex-row gap-2">
          {course.isNew && (
            <View className="bg-emerald-500 px-2 py-1 rounded-md">
              <Text className="text-white text-[10px] font-medium">NEW</Text>
            </View>
          )}
          <View
            className="px-2 py-1 rounded-md"
            style={{ backgroundColor: `${getDifficultyColor(course.difficulty)}20` }}
          >
            <Text
              className="text-[10px] font-medium"
              style={{ color: getDifficultyColor(course.difficulty) }}
            >
              {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
            </Text>
          </View>
        </View>

        <View className="p-4">
          <Text className="text-lg text-white mb-1">{course.title}</Text>
          <Text className="text-sm text-neutral-400 mb-4" numberOfLines={2}>
            {course.subtitle}
          </Text>

          {/* Instructor */}
          <View className="flex-row items-center gap-2 mb-4">
            <Image source={{ uri: course.instructor.avatar }} className="w-6 h-6 rounded-full" contentFit="cover" />
            <Text className="text-sm text-neutral-300">{course.instructor.name}</Text>
          </View>

          {/* Meta */}
          <View className="flex-row flex-wrap gap-4">
            <View className="flex-row items-center gap-1">
              <Clock color="#a3a3a3" size={14} />
              <Text className="text-xs text-neutral-400">
                {Math.floor(course.duration / 60)}h {course.duration % 60}m
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <BookOpen color="#a3a3a3" size={14} />
              <Text className="text-xs text-neutral-400">{course.lessonsCount} lessons</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Star color="#fbbf24" size={14} fill="#fbbf24" />
              <Text className="text-xs text-neutral-400">{course.rating}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Users color="#a3a3a3" size={14} />
              <Text className="text-xs text-neutral-400">{course.studentsCount.toLocaleString()}</Text>
            </View>
          </View>

          {/* Progress */}
          {course.progress !== undefined && course.progress > 0 && (
            <View className="mt-4 gap-1.5">
              <View className="h-1 bg-neutral-800 rounded-full">
                <View
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: `${course.progress}%` }}
                />
              </View>
              <Text className="text-xs text-sky-400">{course.progress}% complete</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
