import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { DollarSign, FileText, ChevronRight, MapPin } from "lucide-react-native";
import { AustralianState } from "@/lib/data/academy";
import { cn } from "@/lib/utils";

interface StateGuideCardProps {
  state: AustralianState;
  onPress?: () => void;
  compact?: boolean;
}

export function StateGuideCard({ state, onPress, compact = false }: StateGuideCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="bg-neutral-950 rounded-2xl border border-neutral-800 p-4 active:opacity-70"
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-center mb-2">
          <View className="bg-violet-500/20 px-2 py-1 rounded-md">
            <Text className="text-violet-400 text-xs font-medium">{state.abbrev}</Text>
          </View>
          <ChevronRight color="#525252" size={16} />
        </View>
        <Text className="text-white text-sm mb-3" numberOfLines={1}>
          {state.name}
        </Text>
        <View className="gap-2">
          <View className="flex-row items-center gap-1.5">
            <DollarSign color="#10b981" size={12} />
            <Text className="text-neutral-400 text-[11px]">{formatCurrency(state.fhogAmount)} FHOG</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <FileText color="#38bdf8" size={12} />
            <Text className="text-neutral-400 text-[11px]">{state.keyLegislation.length} Acts</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden active:opacity-70"
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="p-5 border-b border-neutral-800">
        <View className="flex-row items-center gap-3 mb-3">
          <View className="bg-violet-500/20 px-3 py-1.5 rounded-lg">
            <Text className="text-violet-400 text-lg font-semibold">{state.abbrev}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-lg font-semibold">{state.name}</Text>
            <Text className="text-neutral-500 text-sm">Property Buying Guide</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-4">
          <StatBadge
            icon={<DollarSign color="#10b981" size={14} />}
            label="FHOG"
            value={formatCurrency(state.fhogAmount)}
          />
          {state.stampDutyExemptionThreshold > 0 && (
            <StatBadge
              icon={<FileText color="#38bdf8" size={14} />}
              label="Duty Exemption"
              value={`Up to ${formatCurrency(state.stampDutyExemptionThreshold)}`}
            />
          )}
        </View>
      </View>

      {/* Details */}
      <View className="p-5 gap-3">
        <DetailRow label="Property Cap" value={formatCurrency(state.fhogThreshold)} />
        <DetailRow
          label="Eligibility"
          value={state.fhogNewOnly ? "New homes only" : "New & established"}
        />
        {state.foreignBuyerSurcharge > 0 && (
          <DetailRow label="Foreign Surcharge" value={`${state.foreignBuyerSurcharge}%`} />
        )}
      </View>

      {/* Footer */}
      <View className="px-5 py-3 bg-neutral-950 border-t border-neutral-800 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <MapPin color="#737373" size={14} />
          <Text className="text-neutral-500 text-sm">{state.resources.length} Resources</Text>
        </View>
        <ChevronRight color="#525252" size={18} />
      </View>
    </TouchableOpacity>
  );
}

function StatBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-2 bg-neutral-900 px-3 py-2 rounded-lg">
      {icon}
      <View>
        <Text className="text-neutral-500 text-[10px] uppercase tracking-wide">{label}</Text>
        <Text className="text-white text-sm font-medium">{value}</Text>
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-neutral-500 text-sm">{label}</Text>
      <Text className="text-white text-sm font-medium">{value}</Text>
    </View>
  );
}

interface StateGuideGridProps {
  states: AustralianState[];
  onSelectState: (state: AustralianState) => void;
}

export function StateGuideGrid({ states, onSelectState }: StateGuideGridProps) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {states.map((state) => (
        <View key={state.id} className="w-[48%]">
          <StateGuideCard
            state={state}
            onPress={() => onSelectState(state)}
            compact
          />
        </View>
      ))}
    </View>
  );
}

interface StateGuideListProps {
  states: AustralianState[];
  onSelectState: (state: AustralianState) => void;
}

export function StateGuideList({ states, onSelectState }: StateGuideListProps) {
  return (
    <View className="gap-3">
      {states.map((state) => (
        <StateGuideCard
          key={state.id}
          state={state}
          onPress={() => onSelectState(state)}
        />
      ))}
    </View>
  );
}
