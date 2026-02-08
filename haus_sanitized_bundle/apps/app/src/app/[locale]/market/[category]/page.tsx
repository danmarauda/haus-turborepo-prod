import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CategoryContent } from "@/components/market/category-content"

const categoryMeta: Record<string, { title: string; description: string }> = {
  conveyancing: {
    title: "Conveyancing Services",
    description:
      "Find licensed conveyancers for property settlements, contract reviews, and title searches across Australia.",
  },
  legal: {
    title: "Property Lawyers",
    description: "Legal experts specializing in property law, contract disputes, and complex transactions.",
  },
  "property-lawyer": {
    title: "Property Lawyers",
    description: "Legal experts specializing in property law, contract disputes, and complex transactions.",
  },
  "buyers-agent": {
    title: "Buyer's Agents",
    description: "Expert property negotiators and buyer's advocates to help you secure the best deal.",
  },
  "building-inspection": {
    title: "Building Inspections",
    description: "Comprehensive pre-purchase building inspections with detailed reports and thermal imaging.",
  },
  "pest-inspection": {
    title: "Pest Inspections",
    description: "Termite and pest detection specialists with same-day inspection reports.",
  },
  "mortgage-broker": {
    title: "Mortgage Brokers",
    description: "Compare home loans from 40+ lenders with free broker services.",
  },
  removalist: {
    title: "Removalist Services",
    description: "Professional moving services for local and interstate relocations.",
  },
  removalists: {
    title: "Removalist Services",
    description: "Professional moving services for local and interstate relocations.",
  },
  styling: {
    title: "Property Styling",
    description: "Professional property staging to maximize your sale price.",
  },
  photography: {
    title: "Property Photography",
    description: "Professional real estate photography, drone shots, and virtual tours.",
  },
  valuation: {
    title: "Property Valuations",
    description: "Certified property valuers for market valuations and bank assessments.",
  },
  cleaning: {
    title: "Cleaning Services",
    description: "End of lease, pre-sale, and deep cleaning services.",
  },
  renovation: {
    title: "Renovation Services",
    description: "Builders and renovation specialists for kitchen, bathroom, and full home renovations.",
  },
  repairs: {
    title: "Pre-sale Repairs",
    description: "Handyman and maintenance services for pre-sale property preparation.",
  },
}

const validCategories = Object.keys(categoryMeta)

type PageProps = {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const meta = categoryMeta[category]

  if (!meta) {
    return {
      title: "Category Not Found | HAUS Market",
    }
  }

  return {
    title: `${meta.title} | HAUS Market`,
    description: meta.description,
    openGraph: {
      title: `${meta.title} | HAUS Market`,
      description: meta.description,
    },
  }
}

export async function generateStaticParams() {
  return validCategories.map((category) => ({ category }))
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params

  if (!validCategories.includes(category)) {
    notFound()
  }

  const meta = categoryMeta[category]!

  return <CategoryContent category={category} title={meta.title} description={meta.description} />
}
