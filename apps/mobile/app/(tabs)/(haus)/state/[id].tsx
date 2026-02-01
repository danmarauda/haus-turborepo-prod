import React from "react";
import { ScrollView, View, Text, TouchableOpacity, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import {
  ChevronLeft,
  DollarSign,
  FileText,
  ExternalLink,
  Calculator,
  Scale,
  BookOpen,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react-native";
import { getStateById, stateCourses, calculateStampDuty } from "@/lib/data/academy";
import { cn } from "@/lib/utils";

export default function StateDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const state = getStateById(id || "");
  const stateCourse = stateCourses.find((c) => c.id === `state-${id}`);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!state) {
    return (
      <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-neutral-400 text-lg mb-6">State not found</Text>
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

  const exampleStampDuty500k = calculateStampDuty(state.id, 500000);
  const exampleStampDuty750k = calculateStampDuty(state.id, 750000);
  const exampleStampDuty1m = calculateStampDuty(state.id, 1000000);

  return (
    <View className="flex-1 bg-black" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-neutral-900 items-center justify-center">
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text className="text-lg text-white">{state.abbrev} Guide</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5 gap-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6 items-center">
          <View className="bg-violet-500/20 px-4 py-2 rounded-xl mb-4">
            <Text className="text-violet-400 text-2xl">{state.abbrev}</Text>
          </View>
          <Text className="text-white text-2xl mb-1 text-center">{state.name}</Text>
          <Text className="text-neutral-400 text-sm">Complete property buying guide</Text>
        </View>

        {/* FHOG Section */}
        <View className="gap-3">
          <Text className="text-lg text-white">First Home Owner Grant</Text>
          <View className="bg-neutral-950 rounded-xl border border-neutral-800 p-5">
            <View className="flex-row items-center gap-4 mb-5">
              <DollarSign color="#10b981" size={24} />
              <Text className="text-emerald-500 text-3xl">{formatCurrency(state.fhogAmount)}</Text>
            </View>
            <View className="gap-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-neutral-400 text-sm">Property cap</Text>
                <Text className="text-white text-sm">{formatCurrency(state.fhogThreshold)}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-neutral-400 text-sm">Eligibility</Text>
                <Text className="text-white text-sm">
                  {state.fhogNewOnly ? "New homes only" : "New & established"}
                </Text>
              </View>
            </View>
            {state.fhogAmount >= 20000 && (
              <View className="flex-row items-center gap-2 bg-emerald-500/10 p-4 rounded-xl mt-5">
                <CheckCircle color="#10b981" size={16} />
                <Text className="text-emerald-500 text-sm">One of Australia&apos;s most generous grants!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stamp Duty Section */}
        <View className="gap-3">
          <Text className="text-lg text-white">Stamp Duty Estimates</Text>
          <View className="bg-neutral-950 rounded-xl border border-neutral-800 p-5 gap-3">
            <StampDutyRow label="$500,000 property" value={formatCurrency(Math.round(exampleStampDuty500k))} />
            <StampDutyRow label="$750,000 property" value={formatCurrency(Math.round(exampleStampDuty750k))} />
            <StampDutyRow label="$1,000,000 property" value={formatCurrency(Math.round(exampleStampDuty1m))} />
            {state.stampDutyExemptionThreshold > 0 && (
              <View className="flex-row items-center gap-2 bg-sky-500/10 p-4 rounded-xl mt-2">
                <AlertCircle color="#38bdf8" size={16} />
                <Text className="text-sky-400 text-sm flex-1">
                  FHB exemption up to {formatCurrency(state.stampDutyExemptionThreshold)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Foreign Buyer Surcharge */}
        {state.foreignBuyerSurcharge > 0 && (
          <View className="gap-3">
            <Text className="text-lg text-white">Foreign Buyer Surcharge</Text>
            <View className="bg-neutral-950 rounded-xl border border-neutral-800 p-5 flex-row items-baseline gap-2">
              <Text className="text-amber-500 text-2xl">{state.foreignBuyerSurcharge}%</Text>
              <Text className="text-neutral-400 text-sm">additional duty for foreign buyers</Text>
            </View>
          </View>
        )}

        {/* Key Legislation */}
        <View className="gap-3">
          <Text className="text-lg text-white">Key Legislation</Text>
          <View className="bg-neutral-950 rounded-xl border border-neutral-800 p-5 gap-4">
            {state.keyLegislation.map((act, index) => (
              <View key={index} className="flex-row items-center gap-4">
                <Scale color="#737373" size={16} />
                <Text className="text-neutral-300 text-sm flex-1">{act}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Resources */}
        <View className="gap-3">
          <Text className="text-lg text-white">Official Resources</Text>
          <View className="bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden">
            {state.resources.map((resource, index) => (
              <TouchableOpacity
                key={index}
                className={cn(
                  "flex-row items-center justify-between p-5",
                  index < state.resources.length - 1 && "border-b border-neutral-800"
                )}
                onPress={() => Linking.openURL(resource.url)}
              >
                <View className="flex-row items-center gap-4 flex-1">
                  {resource.type === "government" && <FileText color="#38bdf8" size={18} />}
                  {resource.type === "calculator" && <Calculator color="#10b981" size={18} />}
                  {resource.type === "guide" && <BookOpen color="#f59e0b" size={18} />}
                  <Text className="text-white text-sm flex-1">{resource.title}</Text>
                </View>
                <ExternalLink color="#737373" size={16} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Course Link */}
        {stateCourse && (
          <View className="gap-3">
            <Text className="text-lg text-white">Complete {state.abbrev} Course</Text>
            <TouchableOpacity
              className="bg-neutral-950 rounded-xl border border-neutral-800 p-5 flex-row items-center justify-between"
              onPress={() => router.push(`/(tabs)/(haus)/course/${stateCourse.id}` as any)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-4 flex-1">
                <View className="w-12 h-12 rounded-xl bg-violet-500/20 items-center justify-center">
                  <BookOpen color="#fff" size={20} />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base mb-0.5">{stateCourse.title}</Text>
                  <Text className="text-neutral-500 text-xs">
                    {stateCourse.lessonsCount} lessons · {Math.floor(stateCourse.duration / 60)}h {stateCourse.duration % 60}m
                  </Text>
                </View>
              </View>
              <ChevronRight color="#737373" size={20} />
            </TouchableOpacity>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}

function StampDutyRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-2 border-b border-neutral-800 last:border-0">
      <Text className="text-neutral-400 text-sm">{label}</Text>
      <Text className="text-white text-base">{value}</Text>
    </View>
  );
}
