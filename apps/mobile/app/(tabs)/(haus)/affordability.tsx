import React, { useMemo, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, TextInput, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calculator, DollarSign, Home, TrendingUp, Info } from "lucide-react-native";
import { router } from "expo-router";
import { cn } from "@/lib/utils";

export default function AffordabilityScreen() {
  const insets = useSafeAreaInsets();
  const [income, setIncome] = useState<string>("150000");
  const [deposit, setDeposit] = useState<string>("100000");
  const [interestRate, setInterestRate] = useState<string>("6.5");
  const [loanTerm, setLoanTerm] = useState<string>("30");
  const [includeExtras, setIncludeExtras] = useState<boolean>(true);

  const calculations = useMemo(() => {
    const incomeNum = parseFloat(income) || 0;
    const depositNum = parseFloat(deposit) || 0;
    const rate = parseFloat(interestRate) || 6.5;
    const term = parseFloat(loanTerm) || 30;

    const maxLoanAmount = Math.min(incomeNum * 6, 1000000);
    const maxPurchasePrice = maxLoanAmount + depositNum;

    const monthlyRate = rate / 100 / 12;
    const numPayments = term * 12;
    const monthlyRepayment =
      (maxLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const stampDuty = maxPurchasePrice * 0.055;
    const legalFees = 2500;
    const inspection = 800;
    const lmi = depositNum < maxPurchasePrice * 0.2 ? maxLoanAmount * 0.025 : 0;
    const totalUpfront = depositNum + stampDuty + legalFees + inspection + lmi;

    const councilRates = 2400 / 12;
    const insurance = 1200 / 12;
    const strata = 800;
    const maintenance = 200;
    const totalMonthly = monthlyRepayment + councilRates + insurance + strata + maintenance;

    return {
      maxLoan: maxLoanAmount,
      maxPrice: maxPurchasePrice,
      monthlyRepayment: Math.round(monthlyRepayment),
      stampDuty: Math.round(stampDuty),
      legalFees,
      inspection,
      lmi: Math.round(lmi),
      totalUpfront: Math.round(totalUpfront),
      councilRates: Math.round(councilRates),
      insurance: Math.round(insurance),
      strata,
      maintenance,
      totalMonthly: Math.round(totalMonthly),
    };
  }, [income, deposit, interestRate, loanTerm]);

  return (
    <View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
        {/* Header */}
        <View className="flex-row items-center gap-2">
          <Calculator color="#38bdf8" size={24} />
          <Text className="text-white text-xl font-semibold">Affordability Calculator</Text>
        </View>

        {/* Input Card */}
        <View className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 gap-3">
          <Text className="text-white text-base font-semibold mb-1">Your Details</Text>

          {/* Income Input */}
          <View className="gap-1.5">
            <Text className="text-neutral-400 text-sm">Annual Income</Text>
            <View className="flex-row items-center gap-2 border border-neutral-700 bg-neutral-800 rounded-lg px-3 py-2.5">
              <DollarSign color="#a3a3a3" size={16} />
              <TextInput
                value={income}
                onChangeText={setIncome}
                keyboardType="numeric"
                className="flex-1 text-white text-base"
                placeholderTextColor="#737373"
              />
            </View>
          </View>

          {/* Deposit Input */}
          <View className="gap-1.5">
            <Text className="text-neutral-400 text-sm">Deposit Available</Text>
            <View className="flex-row items-center gap-2 border border-neutral-700 bg-neutral-800 rounded-lg px-3 py-2.5">
              <DollarSign color="#a3a3a3" size={16} />
              <TextInput
                value={deposit}
                onChangeText={setDeposit}
                keyboardType="numeric"
                className="flex-1 text-white text-base"
                placeholderTextColor="#737373"
              />
            </View>
          </View>

          {/* Rate & Term Row */}
          <View className="flex-row gap-3">
            <View className="flex-1 gap-1.5">
              <Text className="text-neutral-400 text-sm">Interest Rate (%)</Text>
              <TextInput
                value={interestRate}
                onChangeText={setInterestRate}
                keyboardType="numeric"
                className="border border-neutral-700 bg-neutral-800 rounded-lg px-3 py-2.5 text-white text-base"
                placeholderTextColor="#737373"
              />
            </View>
            <View className="flex-1 gap-1.5">
              <Text className="text-neutral-400 text-sm">Loan Term (years)</Text>
              <TextInput
                value={loanTerm}
                onChangeText={setLoanTerm}
                keyboardType="numeric"
                className="border border-neutral-700 bg-neutral-800 rounded-lg px-3 py-2.5 text-white text-base"
                placeholderTextColor="#737373"
              />
            </View>
          </View>

          {/* Toggle */}
          <View className="flex-row items-center justify-between mt-1.5">
            <Text className="text-neutral-300 text-sm">Include all ongoing costs</Text>
            <Switch
              value={includeExtras}
              onValueChange={setIncludeExtras}
              trackColor={{ false: "#404040", true: "#0ea5e9" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Result Card */}
        <View className="rounded-xl border border-sky-600 bg-sky-500/10 p-4">
          <View className="flex-row items-center gap-4">
            <View className="w-11 h-11 rounded-full bg-sky-500 items-center justify-center">
              <Home color="#fff" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-neutral-300 text-sm">Maximum Property Price</Text>
              <Text className="text-white text-2xl font-bold">
                ${(calculations.maxPrice / 1000).toFixed(0)}k
              </Text>
            </View>
          </View>
        </View>

        {/* Upfront Costs */}
        <View className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 gap-3">
          <View className="flex-row items-center gap-2 mb-1">
            <TrendingUp color="#fbbf24" size={18} />
            <Text className="text-white text-base font-semibold">Upfront Costs</Text>
          </View>
          <View className="gap-1.5">
            <CostRow label="Deposit" value={`$${(parseFloat(deposit) / 1000).toFixed(0)}k`} />
            <CostRow label="Stamp Duty" value={`$${(calculations.stampDuty / 1000).toFixed(1)}k`} />
            <CostRow label="Legal Fees" value={`$${(calculations.legalFees / 1000).toFixed(1)}k`} />
            <CostRow label="Building Inspection" value={`$${calculations.inspection}`} />
            {calculations.lmi > 0 && (
              <CostRow label="LMI (Lenders Mortgage Insurance)" value={`$${(calculations.lmi / 1000).toFixed(1)}k`} />
            )}
            <View className="flex-row items-center justify-between py-1.5 border-t border-neutral-700 mt-1 pt-3">
              <Text className="text-white text-base font-semibold">Total Upfront</Text>
              <Text className="text-white text-base font-bold">
                ${(calculations.totalUpfront / 1000).toFixed(1)}k
              </Text>
            </View>
          </View>
        </View>

        {/* Monthly Costs */}
        {includeExtras && (
          <View className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 gap-3">
            <View className="flex-row items-center gap-2 mb-1">
              <DollarSign color="#34d399" size={18} />
              <Text className="text-white text-base font-semibold">Monthly Costs</Text>
            </View>
            <View className="gap-1.5">
              <CostRow
                label="Loan Repayment"
                value={`$${calculations.monthlyRepayment.toLocaleString()}`}
              />
              <CostRow label="Council Rates" value={`$${calculations.councilRates}`} />
              <CostRow label="Home Insurance" value={`$${calculations.insurance}`} />
              <CostRow label="Strata/Body Corporate" value={`$${calculations.strata}`} />
              <CostRow label="Maintenance Budget" value={`$${calculations.maintenance}`} />
              <View className="flex-row items-center justify-between py-1.5 border-t border-neutral-700 mt-1 pt-3">
                <Text className="text-white text-base font-semibold">Total Monthly</Text>
                <Text className="text-white text-base font-bold">
                  ${calculations.totalMonthly.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Info Card */}
        <View className="flex-row items-start gap-3 rounded-lg bg-sky-500/10 p-4 border border-sky-500/20">
          <Info color="#38bdf8" size={16} className="mt-0.5" />
          <Text className="flex-1 text-neutral-300 text-sm leading-5">
            These are estimates based on typical costs. Your actual costs may vary. Consult with a
            financial advisor for personalized advice.
          </Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          className="bg-neutral-800 border border-neutral-700 rounded-lg py-3.5 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-white text-base font-semibold">Back to HAUS</Text>
        </TouchableOpacity>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}

function CostRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className="text-neutral-400 text-sm">{label}</Text>
      <Text className="text-white text-sm">{value}</Text>
    </View>
  );
}
