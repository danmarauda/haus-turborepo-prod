import type { Metadata } from "next"
import { QuoteRequestContent } from "@/components/market/quote-request-content"

export const metadata: Metadata = {
  title: "Request Quotes | HAUS Market",
  description:
    "Get personalized quotes from verified property service providers. Compare offers and choose the best fit for your needs.",
  openGraph: {
    title: "Request Quotes | HAUS Market",
    description: "Get quotes from verified providers",
  },
}

export default function QuoteRequestPage() {
  return <QuoteRequestContent />
}
