import React from "react";
import { View, Text } from "react-native";
import { Trophy, BookOpen, GraduationCap } from "lucide-react-native";

interface ProgressWidgetProps {
  totalXP: number;
  completedLessons: number;
  certificates: number;
}

export function ProgressWidget({
  totalXP,
  completedLessons,
  certificates,
}: ProgressWidgetProps) {
  return (
    <View className="flex-row gap-2">
      {/* XP Card */}
      <View className="flex-1 bg-neutral-950 rounded-2xl border border-neutral-800 p-3 items-center gap-1">
        <Trophy color="#fbbf24" size={18} />
        <Text className="text-xl text-white">{totalXP}</Text>
        <Text className="text-xs text-neutral-500">XP Earned</Text>
      </View>

      {/* Lessons Card */}
      <View className="flex-1 bg-neutral-950 rounded-2xl border border-neutral-800 p-3 items-center gap-1">
        <BookOpen color="#60a5fa" size={18} />
        <Text className="text-xl text-white">{completedLessons}</Text>
        <Text className="text-xs text-neutral-500">Lessons</Text>
      </View>

      {/* Certificates Card */}
      <View className="flex-1 bg-neutral-950 rounded-2xl border border-neutral-800 p-3 items-center gap-1">
        <GraduationCap color="#34d399" size={18} />
        <Text className="text-xl text-white">{certificates}</Text>
        <Text className="text-xs text-neutral-500">Certificates</Text>
      </View>
    </View>
  );
}
