"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@v1/ui/button"
import { Card, CardContent } from "@v1/ui/card"
import { Badge } from "@v1/ui/badge"
import { Input } from "@v1/ui/input"
import {
  Search,
  MapPin,
  Star,
  Shield,
  CheckCircle2,
  Clock,
  FileText,
  Scale,
  Home,
  Truck,
  Bug,
  Camera,
  Hammer,
  PaintBucket,
  Banknote,
  Users,
  ArrowRight,
  BadgeCheck,
  MessageSquare,
  Building2,
  TrendingUp,
} from "lucide-react"
import type { ServiceCategory } from "@/types/marketplace"

// Local type for display categories
interface DisplayCategory {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

// Local type for featured providers display
interface FeaturedProvider {
  id: string
  businessName: string
  slug: string
  category: string
  description: string
  logo: string
  coverImage?: string
  location: { suburb: string; state: string; postcode: string }
  serviceAreas: string[]
  contact: {
    phone: string
    email: string
    website?: string
  }
  rating: number
  reviewCount: number
  completedJobs: number
  responseTime: string
  pricing: { type: string; startingFrom?: number; currency: string }
  verificationLevel: string
  badges: string[]
  verified: boolean
  featured?: boolean
  createdAt: string
  updatedAt: string
}

// Service categories with icons
const serviceCategories: DisplayCategory[] = [
  {
    id: "conveyancing",
    name: "Conveyancing",
    description: "Property title transfer & settlement",
    icon: <FileText className="w-6 h-6" />,
  },
  {
    id: "legal",
    name: "Property Lawyers",
    description: "Contract review & legal advice",
    icon: <Scale className="w-6 h-6" />,
  },
  {
    id: "building-inspection",
    name: "Building Inspections",
    description: "Pre-purchase structural reports",
    icon: <Home className="w-6 h-6" />,
  },
  {
    id: "pest-inspection",
    name: "Pest Inspections",
    description: "Termite & pest assessments",
    icon: <Bug className="w-6 h-6" />,
  },
  {
    id: "mortgage-broker",
    name: "Mortgage Brokers",
    description: "Home loan specialists",
    icon: <Banknote className="w-6 h-6" />,
  },
  {
    id: "removalists",
    name: "Removalists",
    description: "Professional moving services",
    icon: <Truck className="w-6 h-6" />,
  },
  {
    id: "photography",
    name: "Property Photography",
    description: "Professional listing photos",
    icon: <Camera className="w-6 h-6" />,
  },
  {
    id: "styling",
    name: "Property Styling",
    description: "Home staging & presentation",
    icon: <PaintBucket className="w-6 h-6" />,
  },
  {
    id: "repairs",
    name: "Pre-sale Repairs",
    description: "Handyman & maintenance",
    icon: <Hammer className="w-6 h-6" />,
  },
  {
    id: "cleaning",
    name: "Cleaning Services",
    description: "End of lease & deep cleaning",
    icon: <Home className="w-6 h-6" />,
  },
  {
    id: "buyers-agent",
    name: "Buyer's Agents",
    description: "Property search & negotiation",
    icon: <Users className="w-6 h-6" />,
  },
  {
    id: "property-management",
    name: "Property Management",
    description: "Rental management services",
    icon: <Building2 className="w-6 h-6" />,
  },
]

// Featured providers mock data
const featuredProviders: FeaturedProvider[] = [
  {
    id: "1",
    businessName: "Sydney Conveyancing Co",
    slug: "sydney-conveyancing-co",
    category: "conveyancing",
    description: "Award-winning conveyancing with 20+ years experience in NSW property settlements.",
    logo: "/conveyancing-logo-professional.jpg",
    coverImage: "/modern-office-interior-law-firm.jpg",
    location: { suburb: "Sydney CBD", state: "NSW", postcode: "2000" },
    serviceAreas: ["Sydney Metro", "Inner West", "Eastern Suburbs", "Northern Beaches"],
    contact: {
      phone: "02 9000 1234",
      email: "info@sydneyconveyancing.com.au",
      website: "https://sydneyconveyancing.com.au",
    },
    rating: 4.9,
    reviewCount: 287,
    completedJobs: 1523,
    responseTime: "< 2 hours",
    pricing: { type: "fixed", startingFrom: 990, currency: "AUD" },
    verificationLevel: "platinum",
    badges: ["HAUS Verified", "Top Rated", "Fast Response"],
    verified: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    businessName: "Melbourne Building Inspections",
    slug: "melbourne-building-inspections",
    category: "building-inspection",
    description: "Comprehensive pre-purchase building and pest inspections across Melbourne.",
    logo: "/building-inspection-logo.jpg",
    coverImage: "/inspector-checking-house.jpg",
    location: { suburb: "Richmond", state: "VIC", postcode: "3121" },
    serviceAreas: ["Melbourne Metro", "Bayside", "Inner East", "South East"],
    contact: { phone: "03 9000 5678", email: "book@melbourneinspections.com.au" },
    rating: 4.8,
    reviewCount: 412,
    completedJobs: 2341,
    responseTime: "< 4 hours",
    pricing: { type: "fixed", startingFrom: 450, currency: "AUD" },
    verificationLevel: "gold",
    badges: ["HAUS Verified", "Licensed Inspector"],
    verified: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    businessName: "Brisbane Home Loans",
    slug: "brisbane-home-loans",
    category: "mortgage-broker",
    description: "Independent mortgage brokers helping you find the best home loan rates.",
    logo: "/mortgage-broker-logo.jpg",
    coverImage: "/office-meeting-room.jpg",
    location: { suburb: "Brisbane City", state: "QLD", postcode: "4000" },
    serviceAreas: ["Brisbane", "Gold Coast", "Sunshine Coast"],
    contact: { phone: "07 3000 9012", email: "hello@brisbanehomeloans.com.au" },
    rating: 4.9,
    reviewCount: 189,
    completedJobs: 892,
    responseTime: "< 1 hour",
    pricing: { type: "free", currency: "AUD" },
    verificationLevel: "platinum",
    badges: ["HAUS Verified", "Top Rated", "No Fees"],
    verified: true,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function MarketplaceContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <div className="relative overflow-hidden rounded-[40px] border border-border bg-card backdrop-blur shadow-xl">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

            <div className="relative z-10 p-8 md:p-12">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
                <Shield className="w-3.5 h-3.5" />
                <span>Trusted Property Services Marketplace</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4 max-w-3xl">
                Find Trusted Professionals for Your Property Journey
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mb-8">
                Every service provider is vetted, verified, and reviewed. From conveyancers to removalists, find the
                right professional for your property transaction.
              </p>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search services or providers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 rounded-2xl border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="h-14 pl-12 pr-8 rounded-2xl border border-border bg-background text-foreground appearance-none cursor-pointer focus:border-primary/50 focus:ring-primary/20 focus:outline-none"
                  >
                    <option value="all">All Locations</option>
                    <option value="nsw">New South Wales</option>
                    <option value="vic">Victoria</option>
                    <option value="qld">Queensland</option>
                    <option value="wa">Western Australia</option>
                    <option value="sa">South Australia</option>
                  </select>
                </div>
                <Button className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90">
                  Search
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 mt-8">
                {[
                  { label: "Verified Providers", value: "2,500+" },
                  { label: "Jobs Completed", value: "50,000+" },
                  { label: "Customer Rating", value: "4.8/5" },
                  { label: "Response Time", value: "< 2hrs" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{stat.value}</span> {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators Bar */}
      <section className="py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 p-6 rounded-2xl bg-muted/50 border border-border">
            {[
              { icon: <Shield className="w-5 h-5" />, text: "All providers vetted & verified" },
              { icon: <Star className="w-5 h-5" />, text: "Genuine customer reviews" },
              { icon: <Clock className="w-5 h-5" />, text: "Fast response guaranteed" },
              { icon: <CheckCircle2 className="w-5 h-5" />, text: "Satisfaction protected" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Browse by Service</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the right professional for every step of your property journey
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {serviceCategories.map((category, index) => (
              <Link key={category.id} href={`/market/${category.id}`}>
                <Card
                  className={`group cursor-pointer overflow-hidden border-border bg-card backdrop-blur transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 h-full ${
                    index === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                >
                  <CardContent className={`p-6 ${index === 0 ? "md:p-8" : ""}`}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-primary">
                      {category.icon}
                    </div>
                    <h3 className={`font-semibold text-foreground mb-1 ${index === 0 ? "text-xl" : ""}`}>
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[32px] border border-border bg-card backdrop-blur">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />

            <div className="relative z-10 p-8 md:p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
                <p className="text-muted-foreground">Get connected with trusted professionals in minutes</p>
              </div>

              <div className="grid md:grid-cols-4 gap-8">
                {[
                  { step: "1", title: "Choose Service", desc: "Select the type of service you need" },
                  { step: "2", title: "Compare Providers", desc: "Review ratings, prices, and availability" },
                  { step: "3", title: "Request Quotes", desc: "Get personalized quotes from top providers" },
                  { step: "4", title: "Book & Pay", desc: "Secure booking with payment protection" },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-primary">{item.step}</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/5 border border-amber-500/30 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Featured Providers</h2>
              </div>
              <p className="text-muted-foreground">Top-rated professionals recommended by HAUS</p>
            </div>
            <Button
              variant="outline"
              className="hidden sm:flex rounded-full border-border hover:bg-accent bg-transparent"
            >
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredProviders.map((provider) => (
              <Link key={provider.id} href={`/market/provider/${provider.slug}`}>
                <Card className="group cursor-pointer overflow-hidden border-border bg-card backdrop-blur transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 h-full">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden">
                        <Image
                          src={provider.logo || "/placeholder.svg"}
                          alt={provider.businessName}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{provider.businessName}</h3>
                          {provider.verified && <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {provider.category.replace("-", " ")}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span className="text-sm font-medium text-foreground">{provider.rating}</span>
                          <span className="text-xs text-muted-foreground">({provider.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{provider.description}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        <span>{provider.completedJobs.toLocaleString()} jobs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{provider.responseTime}</span>
                      </div>
                    </div>

                    {/* Pricing & Badges */}
                    <div className="flex items-center justify-between">
                      <div>
                        {provider.pricing.type === "free" ? (
                          <span className="text-sm font-semibold text-primary">Free Service</span>
                        ) : (
                          <span className="text-sm">
                            <span className="text-muted-foreground">From </span>
                            <span className="font-semibold text-foreground">
                              ${provider.pricing.startingFrom?.toLocaleString()}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {provider.badges.slice(0, 2).map((badge) => (
                          <Badge key={badge} variant="outline" className="text-xs border-border bg-muted/50">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HAUS Verified Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[40px] border border-primary/20 bg-card">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 p-8 md:p-12 lg:p-16">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Trust & Safety</span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                    Every Provider is
                    <br />
                    HAUS Verified
                  </h2>

                  <p className="text-muted-foreground mb-8">
                    We personally vet every service provider on our platform. That means verified licenses, current
                    insurance, real customer reviews, and ongoing quality monitoring.
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        icon: <CheckCircle2 className="w-5 h-5" />,
                        title: "License Verified",
                        desc: "All professional licenses checked and validated",
                      },
                      {
                        icon: <FileText className="w-5 h-5" />,
                        title: "Insurance Confirmed",
                        desc: "Current public liability and professional indemnity",
                      },
                      {
                        icon: <Star className="w-5 h-5" />,
                        title: "Reviews Authenticated",
                        desc: "Only verified customers can leave reviews",
                      },
                      {
                        icon: <Clock className="w-5 h-5" />,
                        title: "Response Monitored",
                        desc: "We track response times and service quality",
                      },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-2xl" />
                  <div className="relative bg-card border border-border rounded-3xl p-8">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                        <BadgeCheck className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">HAUS Verified Badge</h3>
                      <p className="text-sm text-muted-foreground mt-2">Your assurance of quality and trust</p>
                    </div>

                    <div className="space-y-3">
                      {[
                        "Background checks completed",
                        "Professional qualifications verified",
                        "Insurance documents validated",
                        "Customer reviews monitored",
                        "Service quality tracked",
                        "Dispute resolution support",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Cards */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer CTA */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card backdrop-blur p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Ready to Get Started?</h3>
                <p className="text-muted-foreground mb-6">
                  Post your requirements and receive quotes from verified providers within hours.
                </p>
                <Link href="/market/quote">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Request Quotes
                  </Button>
                </Link>
              </div>
            </div>

            {/* Provider CTA */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card backdrop-blur p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Are You a Service Provider?</h3>
                <p className="text-muted-foreground mb-6">
                  Join our marketplace and connect with thousands of property buyers and sellers.
                </p>
                <Link href="/market/join">
                  <Button variant="outline" className="rounded-full border-border hover:bg-accent bg-transparent">
                    <Users className="w-4 h-4 mr-2" />
                    Become a Partner
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Redirect Banner */}
      <section className="py-8 px-4 sm:px-6 mb-16">
        <div className="max-w-7xl mx-auto">
          <Link href="/deephaus">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/50 p-6 cursor-pointer hover:border-primary/30 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Looking for Market Analytics?</h3>
                    <p className="text-sm text-muted-foreground">
                      Price trends, auction data, and market insights have moved to DEEPHAUS
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
