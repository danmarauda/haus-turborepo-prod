import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle, Circle, ChevronRight, Award, FileText, TrendingUp, Users } from "lucide-react-native";
import { router } from "expo-router";
import { cn } from "@/lib/utils";

interface PreApprovalStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  route?: string;
}

export default function PreApprovalScreen() {
  const insets = useSafeAreaInsets();

  const steps: PreApprovalStep[] = [
    {
      id: "academy",
      title: "Complete HAUS Academy",
      description: "Learn the fundamentals of property buying",
      completed: true,
    },
    {
      id: "budget",
      title: "Calculate Your Budget",
      description: "Understand true affordability",
      completed: true,
      route: "/(tabs)/(haus)/affordability",
    },
    {
      id: "documents",
      title: "Upload Required Documents",
      description: "ID, payslips, and bank statements",
      completed: false,
      route: "/(tabs)/(haus)/vault",
    },
    {
      id: "credit",
      title: "Credit Check Authorization",
      description: "Allow lenders to assess your credit",
      completed: false,
    },
    {
      id: "lender",
      title: "Choose Your Lender",
      description: "Compare rates and terms",
      completed: false,
    },
    {
      id: "submit",
      title: "Submit Pre-Approval Application",
      description: "Final step to get approved",
      completed: false,
    },
  ];

  const completedSteps = steps.filter((s) => s.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const handleStepPress = (step: PreApprovalStep) => {
    if (step.route) {
      router.push(step.route as any);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-neutral-950"
      contentContainerClassName="p-4 gap-4"
      style={{ paddingTop: insets.top + 12 }}
    >
      {/* Header */}
      <View className="flex-row items-center gap-2">
        <Award color="#fbbf24" size={24} />
        <Text className="text-white text-xl font-bold">Pre-Approval Readiness</Text>
      </View>

      {/* Progress Card */}
      <View className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 gap-4">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-lg bg-sky-500 items-center justify-center">
            <TrendingUp color="#fff" size={20} />
          </View>
          <View className="flex-1">
            <Text className="text-neutral-400 text-sm">Your Progress</Text>
            <Text className="text-white text-lg font-bold">{Math.round(progressPercentage)}% Complete</Text>
          </View>
        </View>
        <View className="h-2 rounded-full bg-neutral-800 overflow-hidden">
          <View className="h-full rounded-full bg-sky-500" style={{ width: `${progressPercentage}%` }} />
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-neutral-400 text-xs">
            {completedSteps} of {steps.length} steps completed
          </Text>
          <Text className="text-neutral-400 text-xs">Est. {(steps.length - completedSteps) * 15} min remaining</Text>
        </View>
      </View>

      {/* Steps Section */}
      <View className="gap-3">
        <Text className="text-white text-base font-semibold mb-1">Roadmap to Pre-Approval</Text>
        {steps.map((step, index) => (
          <TouchableOpacity
            key={step.id}
            className={cn(
              "flex-row items-center justify-between rounded-lg border p-4",
              step.completed
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-neutral-900 border-neutral-800"
            )}
            onPress={() => handleStepPress(step)}
            disabled={!step.route}
          >
            <View className="flex-1 flex-row items-center gap-3">
              <View className="w-8 h-8 items-center justify-center">
                {step.completed ? (
                  <CheckCircle color="#10b981" size={24} />
                ) : (
                  <Circle color="#737373" size={24} />
                )}
              </View>
              <View className="flex-1 gap-1">
                <Text
                  className={cn(
                    "text-base font-semibold",
                    step.completed ? "text-emerald-400" : "text-white"
                  )}
                >
                  {step.title}
                </Text>
                <Text className="text-neutral-400 text-sm">{step.description}</Text>
              </View>
            </View>
            {step.route && <ChevronRight color="#737373" size={20} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Benefits Card */}
      <View className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 gap-4">
        <View className="flex-row items-center gap-2">
          <FileText color="#38bdf8" size={20} />
          <Text className="text-white text-base font-semibold">Benefits of Pre-Approval</Text>
        </View>
        <View className="gap-3">
          <BenefitItem text="Know your exact budget before searching" />
          <BenefitItem text="Stronger negotiating position with sellers" />
          <BenefitItem text="Faster settlement when you find the right property" />
          <BenefitItem text="Identify and fix credit issues early" />
        </View>
      </View>

      {/* CTA Card */}
      <View className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 gap-4">
        <View className="w-12 h-12 rounded-full bg-amber-500 items-center justify-center">
          <Users color="#fff" size={20} />
        </View>
        <View className="gap-1">
          <Text className="text-white text-lg font-bold">Need Help?</Text>
          <Text className="text-neutral-300 text-sm leading-5">
            Talk to a HAUS Pro for personalized guidance on your pre-approval journey.
          </Text>
        </View>
        <TouchableOpacity className="bg-sky-600 rounded-lg py-3 items-center">
          <Text className="text-white text-base font-semibold">Contact Pro</Text>
        </TouchableOpacity>
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <View className="flex-row items-start gap-2">
      <CheckCircle color="#10b981" size={16} className="mt-0.5" />
      <Text className="flex-1 text-neutral-300 text-sm leading-5">{text}</Text>
    </View>
  );
}
