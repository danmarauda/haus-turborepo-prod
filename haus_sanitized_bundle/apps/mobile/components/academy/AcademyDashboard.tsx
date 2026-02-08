import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Play,
  BookOpen,
  TrendingUp,
  Calculator,
  Home,
  ChevronRight,
  Flame,
  Trophy,
  Clock,
  Star,
  GraduationCap,
  MapPin,
  Scale,
  DollarSign,
  FileText,
} from "lucide-react-native";
import {
  courses,
  learningPaths,
  userProgress,
  australianStates,
  stateCourses,
} from "@/lib/data/academy";
import { ProgressWidget } from "./ProgressWidget";
import { CourseCard } from "./CourseCard";
import { cn } from "@/lib/utils";

const { width } = Dimensions.get("window");

export function AcademyDashboard() {
  const insets = useSafeAreaInsets();

  const currentCourse = courses.find((c) => c.id === userProgress.currentCourse);
  const featuredCourses = courses
    .filter((c) => c.isFeatured || c.isNew)
    .slice(0, 3);

  const getPathIcon = (iconName: string, color: string) => {
    const iconProps = { color, size: 20 };
    switch (iconName) {
      case "Home":
        return <Home {...iconProps} />;
      case "TrendingUp":
        return <TrendingUp {...iconProps} />;
      case "Calculator":
        return <Calculator {...iconProps} />;
      case "MapPin":
        return <MapPin {...iconProps} />;
      case "Scale":
        return <Scale {...iconProps} />;
      default:
        return <BookOpen {...iconProps} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 gap-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-[28px] text-white font-normal">HAUS Academy</Text>
            <Text className="text-sm text-neutral-400 mt-0.5">
              Master property investment
            </Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-1 bg-amber-500/15 px-3 py-1.5 rounded-full border border-amber-500/30"
            onPress={() => router.push("/(tabs)/(haus)/progress" as any)}
          >
            <Flame color="#f59e0b" size={16} />
            <Text className="text-amber-400 text-sm">{userProgress.streak}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <ProgressWidget
          totalXP={userProgress.totalXP}
          completedLessons={userProgress.completedLessons.length}
          certificates={userProgress.certificates.length}
        />

        {/* Continue Learning Card */}
        {currentCourse && (
          <TouchableOpacity
            className="h-60 rounded-3xl overflow-hidden relative"
            onPress={() =>
              router.push(`/(tabs)/(haus)/course/${currentCourse.id}` as any)
            }
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: currentCourse.thumbnailUrl }}
              className="w-full h-full"
              contentFit="cover"
            />
            <View className="absolute inset-0 bg-black/55" />
            <View className="absolute inset-0 p-5 justify-between">
              <View className="flex-row justify-between items-center">
                <View className="bg-white/15 px-2.5 py-1.5 rounded-full border border-white/20">
                  <Text className="text-white text-xs">Continue Learning</Text>
                </View>
                <View className="bg-blue-500/20 px-2.5 py-1.5 rounded-full">
                  <Text className="text-blue-300 text-xs">
                    {currentCourse.progress}%
                  </Text>
                </View>
              </View>
              <View>
                <Text className="text-[22px] text-white mb-1">
                  {currentCourse.title}
                </Text>
                <Text className="text-sm text-neutral-300 mb-3">
                  {currentCourse.subtitle}
                </Text>
                {/* Progress Bar */}
                <View className="h-1 bg-white/20 rounded-full mb-4">
                  <View
                    className="h-full bg-blue-400 rounded-full"
                    style={{ width: `${currentCourse.progress ?? 0}%` }}
                  />
                </View>
                <TouchableOpacity
                  className="flex-row items-center justify-center gap-2 bg-white/15 border border-white/25 py-3 rounded-xl"
                  onPress={() =>
                    router.push(
                      `/(tabs)/(haus)/lesson/${currentCourse.id}/${userProgress.currentLesson}` as any
                    )
                  }
                >
                  <Play color="#fff" size={16} fill="#fff" />
                  <Text className="text-white text-base">Resume Lesson</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Learning Paths Section */}
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg text-white">Learning Paths</Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/(haus)/courses" as any)}
            >
              <Text className="text-sky-400 text-sm">See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2"
          >
            {learningPaths.map((path) => (
              <TouchableOpacity
                key={path.id}
                className="w-40 bg-neutral-950 rounded-2xl border border-neutral-800 p-4"
                onPress={() => router.push(`/(tabs)/(haus)/path/${path.id}` as any)}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                  style={{ backgroundColor: `${path.color}20` }}
                >
                  {getPathIcon(path.icon, path.color)}
                </View>
                <Text className="text-sm text-white mb-1">{path.title}</Text>
                <Text className="text-xs text-neutral-500">
                  {path.coursesCount} courses · {path.duration}
                </Text>
                <View className="absolute top-3 right-3">
                  <ChevronRight color="#737373" size={16} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Courses Section */}
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg text-white">Featured Courses</Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/(haus)/courses" as any)}
            >
              <Text className="text-sky-400 text-sm">Browse All</Text>
            </TouchableOpacity>
          </View>
          <View className="gap-3">
            {featuredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onPress={() =>
                  router.push(`/(tabs)/(haus)/course/${course.id}` as any)
                }
              />
            ))}
          </View>
        </View>

        {/* State Guides Section */}
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg text-white">Your State Guide</Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/(haus)/state-selector" as any)}
            >
              <Text className="text-sky-400 text-sm">All States</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2"
          >
            {australianStates.slice(0, 4).map((state) => {
              const stateCourse = stateCourses.find(
                (c) => c.id === `state-${state.id}`
              );
              return (
                <TouchableOpacity
                  key={state.id}
                  className="w-40 bg-neutral-950 rounded-2xl border border-neutral-800 p-4"
                  onPress={() =>
                    router.push(`/(tabs)/(haus)/state/${state.id}` as any)
                  }
                  activeOpacity={0.7}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="bg-violet-500/15 px-2 py-1 rounded-md">
                      <Text className="text-violet-400 text-xs">
                        {state.abbrev}
                      </Text>
                    </View>
                    <ChevronRight color="#525252" size={16} />
                  </View>
                  <Text className="text-sm text-white mb-2">{state.name}</Text>
                  <View className="gap-1">
                    <View className="flex-row items-center gap-1">
                      <DollarSign color="#10b981" size={12} />
                      <Text className="text-neutral-400 text-[11px]">
                        {formatCurrency(state.fhogAmount)} FHOG
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <FileText color="#38bdf8" size={12} />
                      <Text className="text-neutral-400 text-[11px]">
                        {state.keyLegislation.length} Acts
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Quick Actions Section */}
        <View className="gap-3">
          <Text className="text-lg text-white">Quick Actions</Text>
          <View className="flex-row flex-wrap gap-2">
            <TouchableOpacity
              className="bg-neutral-950 rounded-2xl border border-neutral-800 p-4"
              style={{ width: (width - 48 - 8) / 2 }}
              onPress={() => router.push("/(tabs)/(haus)/affordability" as any)}
            >
              <View className="w-10 h-10 rounded-xl items-center justify-center mb-2.5 bg-blue-500/15">
                <Calculator color="#93c5fd" size={20} />
              </View>
              <Text className="text-sm text-white mb-0.5">Affordability</Text>
              <Text className="text-xs text-neutral-500">Calculate budget</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-neutral-950 rounded-2xl border border-neutral-800 p-4"
              style={{ width: (width - 48 - 8) / 2 }}
              onPress={() => router.push("/(tabs)/(haus)/vault" as any)}
            >
              <View className="w-10 h-10 rounded-xl items-center justify-center mb-2.5 bg-sky-500/15">
                <BookOpen color="#7dd3fc" size={20} />
              </View>
              <Text className="text-sm text-white mb-0.5">Document Vault</Text>
              <Text className="text-xs text-neutral-500">Store securely</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-neutral-950 rounded-2xl border border-neutral-800 p-4"
              style={{ width: (width - 48 - 8) / 2 }}
              onPress={() => router.push("/(tabs)/(haus)/preapproval" as any)}
            >
              <View className="w-10 h-10 rounded-xl items-center justify-center mb-2.5 bg-emerald-500/15">
                <TrendingUp color="#6ee7b7" size={20} />
              </View>
              <Text className="text-sm text-white mb-0.5">Pre-Approval</Text>
              <Text className="text-xs text-neutral-500">Get ready</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-neutral-950 rounded-2xl border border-neutral-800 p-4"
              style={{ width: (width - 48 - 8) / 2 }}
              onPress={() => router.push("/(tabs)/(haus)/upload" as any)}
            >
              <View className="w-10 h-10 rounded-xl items-center justify-center mb-2.5 bg-amber-500/15">
                <Star color="#fcd34d" size={20} />
              </View>
              <Text className="text-sm text-white mb-0.5">AI Analysis</Text>
              <Text className="text-xs text-neutral-500">Upload media</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
