"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@haus/ui/card"
import { Button } from "@haus/ui/button"
import { Badge } from "@haus/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@haus/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@haus/ui/avatar"
import { Progress } from "@haus/ui/progress"
import { Textarea } from "@haus/ui/textarea"
import {
  Shield,
  ShieldCheck,
  Star,
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Award,
  Zap,
  ThumbsUp,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Share2,
  Heart,
  FileText,
  BadgeCheck,
  Languages,
  Building2,
  Briefcase,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import type { ServiceProvider, Review } from "@/types/marketplace"

interface ProviderProfileContentProps {
  slug: string
}

// Mock provider data generator
function getMockProvider(slug: string): ServiceProvider {
  return {
    id: "provider-1",
    businessName: "Settle Smart Conveyancing",
    slug: slug,
    category: "conveyancing",
    subcategories: ["Residential", "Commercial", "Off-the-plan"],
    description: `Settle Smart Conveyancing is an award-winning firm with over 15 years of experience in NSW property law. Our team of licensed conveyancers handles everything from contract reviews to settlement, ensuring a smooth and stress-free property transaction.

We pride ourselves on clear communication, transparent pricing, and exceptional service. Our clients appreciate our attention to detail and our commitment to keeping them informed at every step of the process.

Whether you're a first-home buyer or a seasoned investor, we have the expertise to guide you through your property transaction with confidence.`,
    shortDescription: "Award-winning conveyancing with 15+ years experience",
    logoUrl: "/conveyancing-logo-professional.jpg",
    coverImageUrl: "/modern-office-interior-law-firm.jpg",
    verificationLevel: "elite",
    badges: ["haus-verified", "top-rated", "fast-response", "highly-recommended"],
    rating: 4.9,
    reviewCount: 847,
    completedJobs: 2450,
    responseTime: "< 1 hour",
    yearsInBusiness: 15,
    location: {
      city: "Sydney",
      state: "NSW",
      suburbs: ["CBD", "North Shore", "Eastern Suburbs", "Inner West", "Northern Beaches", "Parramatta"],
      serviceRadius: 50,
    },
    pricing: {
      type: "fixed",
      startingFrom: 990,
      currency: "AUD",
      description: "Fixed fee conveyancing with no hidden costs. Price includes all searches and disbursements.",
    },
    contact: {
      phone: "02 9000 1234",
      email: "hello@settlesmart.com.au",
      website: "https://settlesmart.com.au",
    },
    operatingHours: {
      weekdays: "8:30 AM - 6:00 PM",
      weekends: "Saturday 9:00 AM - 1:00 PM",
    },
    languages: ["English", "Mandarin", "Cantonese", "Korean"],
    licenses: [
      { name: "NSW Conveyancing License", number: "LIC-2008-12345", verifiedAt: "2024-01-15" },
      { name: "Australian Institute of Conveyancers", number: "AIC-54321", verifiedAt: "2024-01-15" },
    ],
    insurance: [
      { type: "Professional Indemnity", coverage: 5000000, verifiedAt: "2024-01-15" },
      { type: "Public Liability", coverage: 20000000, verifiedAt: "2024-01-15" },
    ],
    teamSize: 12,
    featured: true,
    availableForUrgent: true,
    createdAt: "2009-03-15",
    lastActiveAt: "2024-12-23",
  }
}

// Mock reviews generator
function getMockReviews(): Review[] {
  return [
    {
      id: "review-1",
      providerId: "provider-1",
      userId: "user-1",
      userName: "Sarah M.",
      userAvatar: "/professional-woman-headshot.png",
      rating: 5,
      title: "Exceptional service from start to finish",
      content:
        "I cannot recommend Settle Smart enough! As a first-home buyer, I was nervous about the whole process, but the team made everything so easy. They explained every step clearly and were always available to answer my questions. Settlement went smoothly and on time. Worth every penny!",
      propertyType: "Apartment",
      serviceDate: "2024-11-15",
      createdAt: "2024-11-20",
      verified: true,
      helpful: 24,
      response: {
        content:
          "Thank you so much for your kind words, Sarah! It was a pleasure helping you with your first home purchase. Wishing you all the best in your new apartment!",
        respondedAt: "2024-11-21",
      },
    },
    {
      id: "review-2",
      providerId: "provider-1",
      userId: "user-2",
      userName: "Michael T.",
      userAvatar: "/man-business-headshot.jpg",
      rating: 5,
      title: "Professional and efficient",
      content:
        "Third time using Settle Smart and they continue to impress. Handled our investment property purchase with the same care as our family home. Communication was excellent throughout. Highly recommend for anyone looking for reliable conveyancing services.",
      propertyType: "House",
      serviceDate: "2024-10-28",
      createdAt: "2024-11-02",
      verified: true,
      helpful: 18,
    },
    {
      id: "review-3",
      providerId: "provider-1",
      userId: "user-3",
      userName: "Jennifer L.",
      rating: 4,
      title: "Good service, minor communication delay",
      content:
        "Overall very happy with the service. The team was knowledgeable and the pricing was fair. Only reason for 4 stars is a slight delay in getting back to me on one occasion, but they apologized and made up for it. Would still recommend.",
      propertyType: "Townhouse",
      serviceDate: "2024-09-15",
      createdAt: "2024-09-22",
      verified: true,
      helpful: 8,
      response: {
        content:
          "Thank you for your feedback, Jennifer. We apologize for the communication delay and have addressed this internally. We appreciate your understanding and are glad we could make things right.",
        respondedAt: "2024-09-23",
      },
    },
    {
      id: "review-4",
      providerId: "provider-1",
      userId: "user-4",
      userName: "David K.",
      userAvatar: "/asian-professional-man.png",
      rating: 5,
      title: "Mandarin-speaking staff was a huge help",
      content:
        "My parents were involved in the purchase and don't speak much English. Having Mandarin-speaking staff made the whole process so much easier for them. Everything was explained clearly in their language. Amazing service!",
      propertyType: "Apartment",
      serviceDate: "2024-08-20",
      createdAt: "2024-08-28",
      verified: true,
      helpful: 31,
    },
    {
      id: "review-5",
      providerId: "provider-1",
      userId: "user-5",
      userName: "Emma R.",
      rating: 5,
      title: "Saved us from a problematic contract",
      content:
        "The team at Settle Smart identified several issues in the contract that we would have missed. They negotiated better terms with the vendor's solicitor and saved us potential headaches down the track. Their expertise is invaluable.",
      propertyType: "House",
      serviceDate: "2024-07-10",
      createdAt: "2024-07-18",
      verified: true,
      helpful: 42,
    },
  ]
}

// Rating breakdown data
const ratingBreakdown = [
  { stars: 5, count: 712, percentage: 84 },
  { stars: 4, count: 102, percentage: 12 },
  { stars: 3, count: 25, percentage: 3 },
  { stars: 2, count: 5, percentage: 0.6 },
  { stars: 1, count: 3, percentage: 0.4 },
]

// Services offered
const servicesOffered = [
  { name: "Contract Review", price: "Included", description: "Thorough review of all contract terms" },
  { name: "Title Search", price: "Included", description: "Full title search and verification" },
  { name: "Settlement", price: "Included", description: "Complete settlement handling" },
  { name: "Strata Report Review", price: "$150", description: "Analysis of strata records for apartments" },
  { name: "Urgent Settlement", price: "+$300", description: "For settlements under 14 days" },
  { name: "Off-the-plan", price: "+$200", description: "Additional work for off-the-plan purchases" },
]

export function ProviderProfileContent({ slug }: ProviderProfileContentProps) {
  const [provider, setProvider] = useState<ServiceProvider | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setProvider(getMockProvider(slug))
      setReviews(getMockReviews())
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [slug])

  if (isLoading || !provider) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-white/10 rounded-[32px]" />
          <div className="h-8 w-64 bg-white/10 rounded" />
          <div className="h-4 w-96 bg-white/10 rounded" />
        </div>
      </main>
    )
  }

  const getVerificationBadge = (level: string) => {
    switch (level) {
      case "elite":
        return {
          label: "Elite Partner",
          className: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30",
          icon: Award,
        }
      case "premium":
        return { label: "Premium", className: "bg-primary/20 text-primary border-primary/30", icon: ShieldCheck }
      default:
        return {
          label: "Verified",
          className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          icon: Shield,
        }
    }
  }

  const verificationBadge = getVerificationBadge(provider.verificationLevel)
  const VerificationIcon = verificationBadge.icon

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/market" className="hover:text-foreground transition-colors">
          Market
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/market/${provider.category}`} className="hover:text-foreground transition-colors capitalize">
          {provider.category.replace(/-/g, " ")}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{provider.businessName}</span>
      </nav>

      {/* Hero Section */}
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-[32px] border border-border bg-card backdrop-blur dark:border-white/10">
          {/* Cover Image */}
          <div className="h-48 sm:h-64 relative overflow-hidden">
            <img
              src={provider.coverImageUrl || "/placeholder.svg?height=400&width=1200&query=modern office"}
              alt={`${provider.businessName} office`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>

          {/* Profile Content */}
          <div className="relative px-6 sm:px-10 pb-8 -mt-20">
            <div className="flex flex-col lg:flex-row lg:items-end gap-6">
              {/* Logo */}
              <div className="w-32 h-32 rounded-2xl border-4 border-background bg-white/10 overflow-hidden flex-shrink-0">
                <img
                  src={provider.logoUrl || "/placeholder.svg"}
                  alt={provider.businessName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className={`${verificationBadge.className}`}>
                    <VerificationIcon className="w-3 h-3 mr-1" />
                    {verificationBadge.label}
                  </Badge>
                  {provider.badges.includes("top-rated") && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Top Rated
                    </Badge>
                  )}
                  {provider.availableForUrgent && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      <Zap className="w-3 h-3 mr-1" />
                      Urgent Available
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground mb-2">
                  {provider.businessName}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {provider.location.city}, {provider.location.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{provider.yearsInBusiness} years in business</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{provider.teamSize} team members</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span className="text-xl font-semibold text-foreground">{provider.rating}</span>
                    </div>
                    <span className="text-muted-foreground">({provider.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-foreground font-medium">{provider.completedJobs.toLocaleString()}</span>
                    <span className="text-muted-foreground">jobs completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">Responds {provider.responseTime}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 px-6">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Request Quote
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-xl border-white/10 ${isSaved ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-white/5"}`}
                    onClick={() => setIsSaved(!isSaved)}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-xl border-white/10 bg-white/5">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1 w-full justify-start">
              <TabsTrigger
                value="overview"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Services
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Reviews
              </TabsTrigger>
              <TabsTrigger
                value="credentials"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Credentials
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <Card className="border-border bg-card backdrop-blur dark:border-white/10">
                <CardHeader>
                  <CardTitle>About {provider.businessName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{provider.description}</p>
                </CardContent>
              </Card>

              {/* Service Areas */}
              <Card className="border-border bg-card backdrop-blur dark:border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Service Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.location.suburbs.map((suburb) => (
                      <Badge key={suburb} variant="outline" className="border-white/10 bg-white/5">
                        {suburb}
                      </Badge>
                    ))}
                  </div>
                  {provider.location.serviceRadius && (
                    <p className="text-sm text-muted-foreground mt-4">
                      Services available within {provider.location.serviceRadius}km of {provider.location.city}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Languages */}
              <Card className="border-border bg-card backdrop-blur dark:border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="w-5 h-5 text-primary" />
                    Languages Spoken
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.languages.map((lang) => (
                      <Badge key={lang} variant="outline" className="border-white/10 bg-white/5">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="mt-6">
              <Card className="border-border bg-card backdrop-blur dark:border-white/10">
                <CardHeader>
                  <CardTitle>Services & Pricing</CardTitle>
                  <p className="text-sm text-muted-foreground">{provider.pricing.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {servicesOffered.map((service) => (
                      <div
                        key={service.name}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                      >
                        <div>
                          <h4 className="font-medium text-foreground">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                        <Badge
                          className={
                            service.price === "Included"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-white/10 text-foreground border-white/10"
                          }
                        >
                          {service.price}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Standard conveyancing from</p>
                        <p className="text-2xl font-semibold text-foreground">
                          ${provider.pricing.startingFrom?.toLocaleString()}
                        </p>
                      </div>
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
                        Get a Quote
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6 space-y-6">
              {/* Rating Summary */}
              <Card className="border-border bg-card backdrop-blur dark:border-white/10">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-8">
                    {/* Overall Rating */}
                    <div className="text-center sm:text-left">
                      <div className="text-5xl font-bold text-foreground mb-2">{provider.rating}</div>
                      <div className="flex items-center justify-center sm:justify-start gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(provider.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{provider.reviewCount} reviews</p>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="flex-1 space-y-2">
                      {ratingBreakdown.map((item) => (
                        <div key={item.stars} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-12">{item.stars} star</span>
                          <Progress value={item.percentage} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground w-12">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="border-border bg-card backdrop-blur dark:border-white/10">
                    <CardContent className="p-6">
                      {/* Review Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={review.userAvatar || "/placeholder.svg"} />
                            <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{review.userName}</span>
                              {review.verified && (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                                  <BadgeCheck className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{review.propertyType}</span>
                              <span>•</span>
                              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Review Content */}
                      <h4 className="font-medium text-foreground mb-2">{review.title}</h4>
                      <p className="text-muted-foreground mb-4">{review.content}</p>

                      {/* Provider Response */}
                      {review.response && (
                        <div className="mt-4 p-4 rounded-xl bg-muted border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">Response from provider</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.response.content}</p>
                        </div>
                      )}

                      {/* Review Actions */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Helpful ({review.helpful})
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button variant="outline" className="w-full border-border bg-transparent">
                Load More Reviews
              </Button>
            </TabsContent>

            {/* Credentials Tab */}
            <TabsContent value="credentials" className="mt-6 space-y-6">
              {/* Licenses */}
              <Card className="border-border bg-card backdrop-blur dark:border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Professional Licenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {provider.licenses.map((license) => (
                    <div
                      key={license.number}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted border border-border"
                    >
                      <div>
                        <h4 className="font-medium text-foreground">{license.name}</h4>
                        <p className="text-sm text-muted-foreground">License #{license.number}</p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Insurance */}
              <Card className="border-border bg-card backdrop-blur dark:border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Insurance Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {provider.insurance.map((ins) => (
                    <div
                      key={ins.type}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted border border-border"
                    >
                      <div>
                        <h4 className="font-medium text-foreground">{ins.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          Coverage up to ${(ins.coverage / 1000000).toFixed(0)}M
                        </p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Current
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* HAUS Verification */}
              <Card className="border-primary/20 bg-primary/5 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">HAUS Verified Provider</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        This provider has passed our verification process including background checks, license
                        verification, and insurance confirmation.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["Background Checked", "License Verified", "Insurance Confirmed", "Reviews Monitored"].map(
                          (item) => (
                            <Badge
                              key={item}
                              variant="outline"
                              className="border-primary/30 bg-primary/10 text-primary"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {item}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Quote Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur sticky top-4">
            <CardHeader>
              <CardTitle>Get a Free Quote</CardTitle>
              <p className="text-sm text-muted-foreground">Typically responds within {provider.responseTime}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea placeholder="Briefly describe your requirements..." className="bg-white/5 border-white/10" />
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl">
                <MessageSquare className="w-4 h-4 mr-2" />
                Request Quote
              </Button>
              <p className="text-xs text-muted-foreground text-center">No obligation • Free quote • Fast response</p>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="border-border bg-card backdrop-blur dark:border-white/10">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <a
                href={`tel:${provider.contact.phone}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
              >
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-foreground">{provider.contact.phone}</span>
              </a>
              <a
                href={`mailto:${provider.contact.email}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
              >
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-foreground">{provider.contact.email}</span>
              </a>
              {provider.contact.website && (
                <a
                  href={provider.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Visit Website</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                </a>
              )}
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card className="border-border bg-card backdrop-blur dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Weekdays</span>
                <span className="text-foreground">{provider.operatingHours.weekdays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Weekends</span>
                <span className="text-foreground">{provider.operatingHours.weekends}</span>
              </div>
            </CardContent>
          </Card>

          {/* Similar Providers */}
          <Card className="border-border bg-card backdrop-blur dark:border-white/10">
            <CardHeader>
              <CardTitle>Similar Providers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "QuickConvey Sydney", rating: 4.8, reviews: 523 },
                { name: "Premier Legal Conveyancing", rating: 4.7, reviews: 412 },
                { name: "EasySettle NSW", rating: 4.9, reviews: 289 },
              ].map((similar) => (
                <Link
                  key={similar.name}
                  href={`/market/provider/${similar.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="text-foreground">{similar.name}</span>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-foreground">{similar.rating}</span>
                    <span className="text-muted-foreground">({similar.reviews})</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
