import type { Metadata } from "next"
import { ProviderProfileContent } from "@/components/market/provider-profile-content"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  // In production, fetch provider data here
  const providerName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return {
    title: `${providerName} | HAUS Market`,
    description: `View profile, reviews, and request quotes from ${providerName} on HAUS Market.`,
    openGraph: {
      title: `${providerName} | HAUS Market`,
      description: `Verified service provider on HAUS Market`,
    },
  }
}

export default async function ProviderProfilePage({ params }: PageProps) {
  const { slug } = await params

  return <ProviderProfileContent slug={slug} />
}
