import type { Metadata } from "next"
import { AgencyContent } from "@/components/agency/agency-content"

export const metadata: Metadata = {
  title: "HAUS.AGENCY | Find Top Real Estate Agents | HAUS",
  description:
    "Connect with Australia's top-performing real estate agents. Browse verified agent profiles, read reviews, and find the perfect agent for your property journey.",
  keywords: [
    "real estate agent",
    "property agent",
    "top agents",
    "Australia",
    "buyer's agent",
    "seller's agent",
    "property appraisal",
  ],
}

export default function AgencyPage() {
  return <AgencyContent />
}
