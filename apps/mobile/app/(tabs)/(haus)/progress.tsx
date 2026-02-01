import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Flame, Trophy, BookOpen, Target, Award, Star, TrendingUp } from "lucide-react-native";
import { userProgress, courses } from "@/lib/data/academy";
import { cn } from "@/lib/utils";

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();

  const totalLessons = courses.reduce((acc, c) => acc + c.lessonsCount, 0);
  const completedLessons = userProgress.completedLessons.length;
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const streakDays = [true, true, true, true, true, false, false];

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-neutral-900 items-center justify-center">
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text className="text-lg text-white">Your Progress</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 gap-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Streak Card */}
        <View className="bg-neutral-950 rounded-2xl border border-neutral-800 p-5">
          <View className="flex-row items-center gap-4 mb-5">
            <View className="w-14 h-14 rounded-full bg-amber-500/15 items-center justify-center">
              <Flame color="#f59e0b" size={28} />
            </View>
            <View>
              <Text className="text-white text-xl">{userProgress.streak} Day Streak</Text>
              <Text className="text-neutral-500 text-sm">Keep learning to maintain your streak!</Text>
            </View>
          </View>
          <View className="flex-row justify-between">
            {weekDays.map((day, index) => (
              <View key={index} className="items-center gap-2">
                <Text className="text-neutral-500 text-xs">{day}</Text>
                <View
                  className={cn(
                    "w-8 h-8 rounded-full items-center justify-center",
                    streakDays[index] ? "bg-amber-500/20" : "bg-neutral-800"
                  )}
                >
                  {streakDays[index] && <Flame color="#f59e0b" size={14} />}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-2">
          <StatCard icon={<Trophy color="#fbbf24" size={24} />} value={userProgress.totalXP} label="Total XP" />
          <StatCard icon={<BookOpen color="#60a5fa" size={24} />} value={completedLessons} label="Lessons Done" />
          <StatCard icon={<Target color="#34d399" size={24} />} value={`${progressPercent}%`} label="Overall" />
          <StatCard
            icon={<Award color="#f472b6" size={24} />}
            value={userProgress.certificates.length}
            label="Certificates"
          />
        </View>

        {/* Overall Progress */}
        <View className="gap-3">
          <Text className="text-lg text-white">Overall Progress</Text>
          <View className="bg-neutral-950 rounded-xl border border-neutral-800 p-5">
            <View className="flex-row items-baseline gap-2 mb-4">
              <Text className="text-sky-400 text-4xl">{progressPercent}%</Text>
              <Text className="text-neutral-500">Complete</Text>
            </View>
            <View className="h-2 bg-neutral-800 rounded-full mb-2">
              <View className="h-full bg-sky-500 rounded-full" style={{ width: `${progressPercent}%` }} />
            </View>
            <Text className="text-neutral-500 text-sm">
              {completedLessons} of {totalLessons} lessons completed
            </Text>
          </View>
        </View>

        {/* Achievements */}
        <View className="gap-3">
          <Text className="text-lg text-white">Achievements</Text>
          {userProgress.achievements.length > 0 ? (
            <View className="gap-3">
              {userProgress.achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  className="flex-row items-center gap-4 bg-neutral-950 rounded-xl border border-neutral-800 p-4"
                >
                  <View className="w-12 h-12 rounded-full bg-amber-500/15 items-center justify-center">
                    <Star color="#fbbf24" size={24} fill="#fbbf24" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base mb-0.5">{achievement.title}</Text>
                    <Text className="text-neutral-500 text-sm mb-1">{achievement.description}</Text>
                    <Text className="text-neutral-600 text-xs">
                      Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center bg-neutral-950 rounded-xl border border-neutral-800 p-8 gap-3">
              <Star color="#525252" size={32} />
              <Text className="text-neutral-500 text-sm text-center">
                Complete lessons to earn achievements
              </Text>
            </View>
          )}
        </View>

        {/* Course Progress */}
        <View className="gap-3">
          <Text className="text-lg text-white">Course Progress</Text>
          {courses
            .filter((c) => (c.progress || 0) > 0)
            .map((course) => (
              <TouchableOpacity
                key={course.id}
                className="flex-row items-center gap-4 bg-neutral-950 rounded-xl border border-neutral-800 p-4"
                onPress={() => router.push(`/(tabs)/(haus)/course/${course.id}` as any)}
              >
                <View className="flex-1">
                  <Text className="text-white text-base mb-2">{course.title}</Text>
                  <View className="h-1 bg-neutral-800 rounded-full mb-1.5">
                    <View
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${course.progress ?? 0}%` }}
                    />
                  </View>
                  <Text className="text-neutral-500 text-xs">{course.progress}% complete</Text>
                </View>
                <TrendingUp color="#38bdf8" size={20} />
              </TouchableOpacity>
            ))}
        </View>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <View
      className="bg-neutral-950 rounded-xl border border-neutral-800 p-4 items-center gap-2"
      style={{ width: "48%" }}
    >
      {icon}
      <Text className="text-white text-2xl">{value}</Text>
      <Text className="text-neutral-500 text-xs">{label}</Text>
    </View>
  );
}
