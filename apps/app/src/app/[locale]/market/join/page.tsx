import type { Metadata } from "next"
import { ProviderJoinContent } from "@/components/market/provider-join-content"

export const metadata: Metadata = {
  title: "Become a Partner | HAUS Market",
  description:
    "Join the HAUS Marketplace as a verified service provider and connect with thousands of property buyers and sellers.",
}

export default function ProviderJoinPage() {
  return <ProviderJoinContent />
}
