import React, { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch } from "react-native";
import { DollarSign, Home, TrendingUp, PiggyBank, Calculator } from "lucide-react-native";
import { cn } from "@/lib/utils";

interface AffordabilityResult {
  maxLoan: number;
  maxPrice: number;
  monthlyRepayment: number;
  stampDuty: number;
  legalFees: number;
  inspection: number;
  lmi: number;
  totalUpfront: number;
  councilRates: number;
  insurance: number;
  strata: number;
  maintenance: number;
  totalMonthly: number;
}

interface AffordabilityCalculatorProps {
  onResultChange?: (result: AffordabilityResult) => void;
  compact?: boolean;
}

export function AffordabilityCalculator({
  onResultChange,
  compact = false,
}: AffordabilityCalculatorProps) {
  const [income, setIncome] = useState<string>("150000");
  const [deposit, setDeposit] = useState<string>("100000");
  const [interestRate, setInterestRate] = useState<string>("6.5");
  const [loanTerm, setLoanTerm] = useState<string>("30");
  const [includeExtras, setIncludeExtras] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const result = useMemo(() => {
    const incomeNum = parseFloat(income) || 0;
    const depositNum = parseFloat(deposit) || 0;
    const rate = parseFloat(interestRate) || 6.5;
    const term = parseFloat(loanTerm) || 30;

    // Simplified max loan calculation (6x annual income, capped at $1M)
    const maxLoanAmount = Math.min(incomeNum * 6, 1000000);
    const maxPurchasePrice = maxLoanAmount + depositNum;

    // Monthly repayment calculation
    const monthlyRate = rate / 100 / 12;
    const numPayments = term * 12;
    const monthlyRepayment =
      (maxLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    // Upfront costs
    const stampDuty = maxPurchasePrice * 0.055; // Simplified 5.5% average
    const legalFees = 2500;
    const inspection = 800;
    const lmi = depositNum < maxPurchasePrice * 0.2 ? maxLoanAmount * 0.025 : 0;
    const totalUpfront = depositNum + stampDuty + legalFees + inspection + lmi;

    // Monthly costs
    const councilRates = 2400 / 12; // $200/month average
    const insurance = 1200 / 12; // $100/month average
    const strata = 800; // Apartment/strata fees
    const maintenance = 200; // Maintenance budget
    const totalMonthly = monthlyRepayment + councilRates + insurance + strata + maintenance;

    const calcResult: AffordabilityResult = {
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

    onResultChange?.(calcResult);
    return calcResult;
  }, [income, deposit, interestRate, loanTerm, onResultChange]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`;
    }
    return `$${amount}`;
  };

  if (compact) {
    return (
      <TouchableOpacity
        className="bg-neutral-950 rounded-2xl border border-neutral-800 p-4"
        onPress={() => setShowDetails(true)}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 rounded-xl bg-sky-500/20 items-center justify-center">
            <Calculator color="#38bdf8" size={20} />
          </View>
          <View className="flex-1">
            <Text className="text-white text-base font-semibold">Affordability Calculator</Text>
            <Text className="text-neutral-500 text-sm">Calculate your buying power</Text>
          </View>
        </View>

        <View className="bg-sky-500/10 rounded-xl p-4 border border-sky-500/20">
          <View className="flex-row items-center gap-2 mb-1">
            <Home color="#38bdf8" size={16} />
            <Text className="text-neutral-400 text-sm">Maximum Property Price</Text>
          </View>
          <Text className="text-white text-2xl font-bold">{formatCurrency(result.maxPrice)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className="bg-neutral-950 rounded-2xl border border-neutral-800 p-5 gap-4">
      {/* Header */}
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-xl bg-sky-500/20 items-center justify-center">
          <Calculator color="#38bdf8" size={20} />
        </View>
        <View>
          <Text className="text-white text-lg font-semibold">Affordability Calculator</Text>
          <Text className="text-neutral-500 text-sm">Estimate your buying power</Text>
        </View>
      </View>

      {/* Inputs */}
      <View className="gap-4">
        <InputField
          label="Annual Income"
          value={income}
          onChangeText={setIncome}
          prefix="$"
          keyboardType="numeric"
        />
        <InputField
          label="Deposit Available"
          value={deposit}
          onChangeText={setDeposit}
          prefix="$"
          keyboardType="numeric"
        />

        <View className="flex-row gap-3">
          <InputField
            label="Interest Rate"
            value={interestRate}
            onChangeText={setInterestRate}
            suffix="%"
            keyboardType="numeric"
            className="flex-1"
          />
          <InputField
            label="Loan Term"
            value={loanTerm}
            onChangeText={setLoanTerm}
            suffix="years"
            keyboardType="numeric"
            className="flex-1"
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-neutral-300 text-sm">Include ongoing costs</Text>
          <Switch
            value={includeExtras}
            onValueChange={setIncludeExtras}
            trackColor={{ false: "#404040", true: "#0ea5e9" }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Results */}
      <View className="bg-sky-500/10 rounded-xl p-5 border border-sky-500/20">
        <View className="flex-row items-center gap-2 mb-2">
          <Home color="#38bdf8" size={18} />
          <Text className="text-neutral-400 text-sm">Maximum Property Price</Text>
        </View>
        <Text className="text-white text-3xl font-bold mb-1">
          {formatCurrency(result.maxPrice)}
        </Text>
        <Text className="text-neutral-500 text-sm">
          Based on {formatCurrency(result.maxLoan)} loan + {formatCurrency(parseFloat(deposit) || 0)} deposit
        </Text>
      </View>

      {/* Upfront Costs */}
      {showDetails && (
        <View className="gap-3">
          <Text className="text-white text-base font-semibold">Upfront Costs</Text>
          <CostRow label="Stamp Duty (est.)" value={formatCurrency(result.stampDuty)} />
          <CostRow label="Legal Fees" value={formatCurrency(result.legalFees)} />
          <CostRow label="Building Inspection" value={formatCurrency(result.inspection)} />
          {result.lmi > 0 && (
            <CostRow label="LMI (Lenders Mortgage Insurance)" value={formatCurrency(result.lmi)} />
          )}
          <View className="h-px bg-neutral-800 my-1" />
          <CostRow
            label="Total Upfront"
            value={formatCurrency(result.totalUpfront)}
            highlighted
          />
        </View>
      )}

      {/* Monthly Costs */}
      {showDetails && includeExtras && (
        <View className="gap-3">
          <Text className="text-white text-base font-semibold">Monthly Costs</Text>
          <CostRow label="Loan Repayment" value={`${formatCurrency(result.monthlyRepayment)}/mo`} />
          <CostRow label="Council Rates" value={`${formatCurrency(result.councilRates)}/mo`} />
          <CostRow label="Home Insurance" value={`${formatCurrency(result.insurance)}/mo`} />
          <CostRow label="Strata/Body Corp" value={`${formatCurrency(result.strata)}/mo`} />
          <CostRow label="Maintenance" value={`${formatCurrency(result.maintenance)}/mo`} />
          <View className="h-px bg-neutral-800 my-1" />
          <CostRow
            label="Total Monthly"
            value={`${formatCurrency(result.totalMonthly)}/mo`}
            highlighted
          />
        </View>
      )}

      {/* Toggle Details */}
      <TouchableOpacity
        onPress={() => setShowDetails(!showDetails)}
        className="py-2 items-center"
      >
        <Text className="text-sky-400 text-sm">
          {showDetails ? "Hide Details" : "Show Details"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  prefix?: string;
  suffix?: string;
  keyboardType?: "default" | "numeric";
  className?: string;
}

function InputField({
  label,
  value,
  onChangeText,
  prefix,
  suffix,
  keyboardType = "default",
  className,
}: InputFieldProps) {
  return (
    <View className={cn("gap-1.5", className)}>
      <Text className="text-neutral-400 text-sm">{label}</Text>
      <View className="flex-row items-center border border-neutral-700 bg-neutral-800 rounded-lg px-3 py-2.5">
        {prefix && <Text className="text-neutral-400 mr-1">{prefix}</Text>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          className="flex-1 text-white text-base"
          placeholderTextColor="#737373"
        />
        {suffix && <Text className="text-neutral-400 ml-1">{suffix}</Text>}
      </View>
    </View>
  );
}

function CostRow({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-center py-1">
      <Text className={cn("text-sm", highlighted ? "text-white font-semibold" : "text-neutral-400")}>
        {label}
      </Text>
      <Text className={cn("text-sm", highlighted ? "text-white font-bold" : "text-white")}>
        {value}
      </Text>
    </View>
  );
}

export type { AffordabilityResult };
