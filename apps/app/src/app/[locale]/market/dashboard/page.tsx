import type { Metadata } from "next"
import { ProviderDashboardContent } from "@/components/market/provider-dashboard-content"

export const metadata: Metadata = {
  title: "Provider Dashboard | HAUS Market",
  description: "Manage your HAUS Marketplace business - view analytics, quotes, reviews, and settings",
}

export default function ProviderDashboardPage() {
  return <ProviderDashboardContent />
}
