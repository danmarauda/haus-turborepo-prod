import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import {
  ChevronLeft,
  Play,
  CheckCircle,
  Clock,
  BookOpen,
  Star,
  Users,
  Lock,
  ChevronDown,
  ChevronRight,
} from "lucide-react-native";
import { getCourseById, userProgress } from "@/lib/data/academy";
import { cn } from "@/lib/utils";

export default function CourseDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const course = getCourseById(id || "");

  if (!course) {
    return (
      <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-neutral-400 text-lg mb-6">Course not found</Text>
          <TouchableOpacity
            className="bg-neutral-800 px-5 py-3 rounded-xl"
            onPress={() => router.back()}
          >
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play color="#fff" size={14} fill="#fff" />;
      case "article":
        return <BookOpen color="#a3a3a3" size={14} />;
      case "quiz":
        return <Star color="#fbbf24" size={14} />;
      case "interactive":
        return <Clock color="#a78bfa" size={14} />;
      default:
        return <BookOpen color="#a3a3a3" size={14} />;
    }
  };

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-neutral-900 items-center justify-center">
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text className="text-lg text-white" numberOfLines={1}>
          Course Details
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative h-56">
          <Image source={{ uri: course.thumbnailUrl }} className="w-full h-full" contentFit="cover" />
          <View className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Hero Content */}
          <View className="absolute bottom-0 left-0 right-0 p-5">
            <View className="flex-row gap-2 mb-3">
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
              {course.isNew && (
                <View className="bg-emerald-500 px-2 py-1 rounded-md">
                  <Text className="text-white text-[10px] font-medium">NEW</Text>
                </View>
              )}
            </View>

            <Text className="text-white text-2xl font-semibold mb-1">{course.title}</Text>
            <Text className="text-neutral-300 text-sm">{course.subtitle}</Text>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row px-5 py-4 gap-4">
          <StatItem icon={<Star color="#fbbf24" size={16} fill="#fbbf24" />} value={course.rating.toString()} />
          <StatItem
            icon={<Users color="#a3a3a3" size={16} />}
            value={`${course.studentsCount.toLocaleString()} students`}
          />
          <StatItem
            icon={<Clock color="#a3a3a3" size={16} />}
            value={`${Math.floor(course.duration / 60)}h ${course.duration % 60}m`}
          />
        </View>

        {/* Instructor */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center gap-4 bg-neutral-950 rounded-xl border border-neutral-800 p-4">
            <Image
              source={{ uri: course.instructor.avatar }}
              className="w-12 h-12 rounded-full"
              contentFit="cover"
            />
            <View>
              <Text className="text-white text-base font-semibold">{course.instructor.name}</Text>
              <Text className="text-neutral-500 text-sm">{course.instructor.title}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View className="px-5 mb-6">
          <Text className="text-white text-lg font-semibold mb-2">About this course</Text>
          <Text className="text-neutral-400 text-base leading-6">{course.description}</Text>
        </View>

        {/* Progress */}
        {course.progress !== undefined && course.progress > 0 && (
          <View className="px-5 mb-6">
            <View className="bg-neutral-950 rounded-xl border border-neutral-800 p-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white font-semibold">Your Progress</Text>
                <Text className="text-sky-400">{course.progress}%</Text>
              </View>
              <View className="h-2 bg-neutral-800 rounded-full">
                <View
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: `${course.progress}%` }}
                />
              </View>
            </View>
          </View>
        )}

        {/* Modules */}
        <View className="px-5 mb-6">
          <Text className="text-white text-lg font-semibold mb-4">
            Course Content ({course.modulesCount} modules)
          </Text>
          <View className="gap-3">
            {course.modules.map((module, moduleIndex) => (
              <View key={module.id} className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
                {/* Module Header */}
                <View className="p-4 border-b border-neutral-800">
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-lg bg-sky-500/20 items-center justify-center">
                      <Text className="text-sky-400 text-sm font-semibold">{moduleIndex + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-base font-semibold">{module.title}</Text>
                      <Text className="text-neutral-500 text-sm">{module.lessons.length} lessons</Text>
                    </View>
                    {module.isLocked && <Lock color="#737373" size={18} />}
                  </View>
                </View>

                {/* Lessons */}
                <View>
                  {module.lessons.map((lesson, lessonIndex) => {
                    const isCompleted = userProgress.completedLessons.includes(lesson.id);
                    const isLocked = module.isLocked || (lessonIndex > 0 && !userProgress.completedLessons.includes(module.lessons[lessonIndex - 1]?.id));

                    return (
                      <TouchableOpacity
                        key={lesson.id}
                        className={cn(
                          "flex-row items-center gap-3 p-4",
                          lessonIndex < module.lessons.length - 1 && "border-b border-neutral-800",
                          isLocked && "opacity-50"
                        )}
                        onPress={() =>
                          !isLocked &&
                          router.push(`/(tabs)/(haus)/lesson/${course.id}/${lesson.id}` as any)
                        }
                        disabled={isLocked}
                      >
                        <View
                          className={cn(
                            "w-8 h-8 rounded-lg items-center justify-center",
                            isCompleted ? "bg-emerald-500/20" : "bg-neutral-800"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle color="#10b981" size={16} />
                          ) : (
                            getLessonTypeIcon(lesson.type)
                          )}
                        </View>
                        <View className="flex-1">
                          <Text
                            className={cn(
                              "text-sm",
                              isCompleted ? "text-emerald-400" : "text-white"
                            )}
                          >
                            {lesson.title}
                          </Text>
                          <Text className="text-neutral-500 text-xs">
                            {lesson.duration} min · {lesson.type}
                          </Text>
                        </View>
                        {!isLocked && <ChevronRight color="#737373" size={16} />}
                        {isLocked && <Lock color="#525252" size={14} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Start/Continue Button */}
        <View className="px-5 pb-8">
          <TouchableOpacity
            className="bg-sky-500 py-4 rounded-xl items-center"
            onPress={() => {
              // Find first incomplete lesson
              for (const module of course.modules) {
                for (const lesson of module.lessons) {
                  if (!userProgress.completedLessons.includes(lesson.id)) {
                    router.push(`/(tabs)/(haus)/lesson/${course.id}/${lesson.id}` as any);
                    return;
                  }
                }
              }
              // All complete, go to first lesson
              const firstLesson = course.modules[0]?.lessons[0];
              if (firstLesson) {
                router.push(`/(tabs)/(haus)/lesson/${course.id}/${firstLesson.id}` as any);
              }
            }}
          >
            <Text className="text-white text-base font-semibold">
              {course.progress && course.progress > 0 ? "Continue Learning" : "Start Course"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function StatItem({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <View className="flex-row items-center gap-1.5 bg-neutral-950 px-3 py-2 rounded-lg border border-neutral-800">
      {icon}
      <Text className="text-neutral-300 text-sm">{value}</Text>
    </View>
  );
}
