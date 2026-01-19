"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Search,
  MapPin,
  Star,
  Award,
  Building2,
  Phone,
  Mail,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Shield,
  BadgeCheck,
  Grid3X3,
  List,
  Clock,
  Home,
  DollarSign,
  Heart,
} from "lucide-react"
import { Button } from "@haus/ui/button"
import { Input } from "@haus/ui/input"
import { Badge } from "@haus/ui/badge"
import { Card, CardContent } from "@haus/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@haus/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@haus/ui/select"
import { Label } from "@haus/ui/label"
import { Textarea } from "@haus/ui/textarea"
import type { Agent, Agency } from "@/types/agent"

// Mock agents data
const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    title: "Senior Sales Agent",
    agency: {
      id: "a1",
      name: "HAUS Premium",
      logo: "/haus-agency-logo.png",
      description: "Premium property specialists",
      phone: "1300 HAUS AU",
      email: "hello@haus.com.au",
      address: "123 Collins St, Melbourne VIC 3000",
      totalAgents: 45,
      totalSales: 2500,
      activeListings: 180,
      avgRating: 4.8,
      reviewCount: 1250,
      serviceAreas: ["Melbourne CBD", "Inner East", "Inner South"],
      specializations: ["Luxury", "Apartments", "Investment"],
      licenseNumber: "074523",
      verified: true,
      foundedYear: 2015,
    },
    image: "/professional-woman-headshot.png",
    bio: "With over 15 years of experience in Melbourne's premium property market, Sarah has built a reputation for exceptional service and outstanding results.",
    specializations: ["Luxury Homes", "Apartments", "First Home Buyers"],
    languages: ["English", "Mandarin"],
    serviceAreas: ["South Yarra", "Toorak", "Prahran", "Melbourne CBD"],
    phone: "0412 345 678",
    email: "sarah@haus.com.au",
    totalSales: 285000000,
    propertiesSold: 342,
    avgDaysOnMarket: 21,
    listToSaleRatio: 98.5,
    rating: 4.9,
    reviewCount: 187,
    licenseNumber: "074523-A",
    licenseVerified: true,
    hausVerified: true,
    activeListings: 12,
    recentSales: 8,
    joinedDate: "2019-03-15",
  },
  {
    id: "2",
    name: "James Chen",
    title: "Principal Agent",
    agency: {
      id: "a1",
      name: "HAUS Premium",
      logo: "/haus-agency-logo.png",
      description: "Premium property specialists",
      phone: "1300 HAUS AU",
      email: "hello@haus.com.au",
      address: "123 Collins St, Melbourne VIC 3000",
      totalAgents: 45,
      totalSales: 2500,
      activeListings: 180,
      avgRating: 4.8,
      reviewCount: 1250,
      serviceAreas: ["Melbourne CBD", "Inner East", "Inner South"],
      specializations: ["Luxury", "Apartments", "Investment"],
      licenseNumber: "074523",
      verified: true,
      foundedYear: 2015,
    },
    image: "/professional-asian-man-headshot.png",
    bio: "James specializes in off-market transactions and has an extensive network of buyers and sellers in Melbourne's eastern suburbs.",
    specializations: ["Off-Market Sales", "Investment Properties", "Downsizers"],
    languages: ["English", "Cantonese", "Mandarin"],
    serviceAreas: ["Balwyn", "Camberwell", "Kew", "Hawthorn"],
    phone: "0423 456 789",
    email: "james@haus.com.au",
    totalSales: 420000000,
    propertiesSold: 456,
    avgDaysOnMarket: 18,
    listToSaleRatio: 99.2,
    rating: 4.95,
    reviewCount: 234,
    licenseNumber: "062891-A",
    licenseVerified: true,
    hausVerified: true,
    activeListings: 15,
    recentSales: 11,
    joinedDate: "2018-06-20",
  },
  {
    id: "3",
    name: "Emma Thompson",
    title: "Sales Consultant",
    agency: {
      id: "a2",
      name: "Metro Realty",
      logo: "/metro-realty-logo.png",
      description: "Your local property experts",
      phone: "03 9999 8888",
      email: "info@metrorealty.com.au",
      address: "45 Chapel St, South Yarra VIC 3141",
      totalAgents: 28,
      totalSales: 1800,
      activeListings: 95,
      avgRating: 4.6,
      reviewCount: 890,
      serviceAreas: ["South Yarra", "Prahran", "Windsor"],
      specializations: ["Apartments", "Townhouses"],
      licenseNumber: "081234",
      verified: true,
      foundedYear: 2010,
    },
    image: "/professional-blonde-woman-headshot.png",
    bio: "Emma is passionate about helping first home buyers navigate the property market with confidence and clarity.",
    specializations: ["First Home Buyers", "Townhouses", "Units"],
    languages: ["English"],
    serviceAreas: ["Richmond", "Cremorne", "Abbotsford", "Collingwood"],
    phone: "0434 567 890",
    email: "emma@metrorealty.com.au",
    totalSales: 125000000,
    propertiesSold: 178,
    avgDaysOnMarket: 25,
    listToSaleRatio: 96.8,
    rating: 4.8,
    reviewCount: 112,
    licenseNumber: "089234-A",
    licenseVerified: true,
    hausVerified: true,
    activeListings: 8,
    recentSales: 5,
    joinedDate: "2020-09-10",
  },
  {
    id: "4",
    name: "Michael Roberts",
    title: "Commercial Director",
    agency: {
      id: "a3",
      name: "HAUS Commercial",
      logo: "/haus-commercial-logo.png",
      description: "Commercial property specialists",
      phone: "1300 HAUS CO",
      email: "commercial@haus.com.au",
      address: "100 Queen St, Melbourne VIC 3000",
      totalAgents: 22,
      totalSales: 950,
      activeListings: 65,
      avgRating: 4.7,
      reviewCount: 420,
      serviceAreas: ["Melbourne CBD", "Docklands", "Southbank"],
      specializations: ["Office", "Retail", "Industrial"],
      licenseNumber: "056789",
      verified: true,
      foundedYear: 2017,
    },
    image: "/professional-man-suit-headshot.png",
    bio: "With a background in commercial development, Michael brings unique insights to commercial property transactions.",
    specializations: ["Commercial Office", "Retail", "Development Sites"],
    languages: ["English"],
    serviceAreas: ["Melbourne CBD", "Docklands", "Southbank", "South Melbourne"],
    phone: "0445 678 901",
    email: "michael@hauscommercial.com.au",
    totalSales: 380000000,
    propertiesSold: 89,
    avgDaysOnMarket: 45,
    listToSaleRatio: 94.5,
    rating: 4.7,
    reviewCount: 67,
    licenseNumber: "045678-A",
    licenseVerified: true,
    hausVerified: true,
    activeListings: 6,
    recentSales: 3,
    joinedDate: "2019-11-05",
  },
]

// Format currency
const formatCurrency = (amount: number) => {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(0)}M`
  }
  return `$${amount.toLocaleString()}`
}

export function AgencyContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedSpecialization, setSelectedSpecialization] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("agents")
  const [savedAgents, setSavedAgents] = useState<string[]>([])
  const [appraisalOpen, setAppraisalOpen] = useState(false)

  // Filter agents
  const filteredAgents = useMemo(() => {
    return mockAgents.filter((agent) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          agent.name.toLowerCase().includes(query) ||
          agent.agency.name.toLowerCase().includes(query) ||
          agent.serviceAreas.some((area) => area.toLowerCase().includes(query))
        if (!matchesSearch) return false
      }

      if (selectedSpecialization !== "all") {
        if (!agent.specializations.some((s) => s.toLowerCase().includes(selectedSpecialization.toLowerCase()))) {
          return false
        }
      }

      return true
    })
  }, [searchQuery, selectedSpecialization])

  // Sort agents
  const sortedAgents = useMemo(() => {
    const sorted = [...filteredAgents]
    switch (sortBy) {
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating)
      case "sales":
        return sorted.sort((a, b) => b.totalSales - a.totalSales)
      case "experience":
        return sorted.sort((a, b) => b.propertiesSold - a.propertiesSold)
      case "reviews":
        return sorted.sort((a, b) => b.reviewCount - a.reviewCount)
      default:
        return sorted
    }
  }, [filteredAgents, sortBy])

  const toggleSaved = (id: string) => {
    setSavedAgents((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                <Users className="w-3 h-3 mr-1" />
                Agent Network
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">HAUS.AGENCY</h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-xl">
                Connect with Australia's top-performing real estate agents. Verified professionals delivering
                exceptional results.
              </p>

              {/* Search */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search agents by name or suburb..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-background border-border rounded-xl"
                  />
                </div>
                <Button
                  size="lg"
                  className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                >
                  Find Agents
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="text-2xl font-bold text-foreground">2,500+</div>
                  <div className="text-sm text-muted-foreground">Verified Agents</div>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="text-2xl font-bold text-foreground">$48B</div>
                  <div className="text-sm text-muted-foreground">Total Sales</div>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="text-2xl font-bold text-foreground">4.8</div>
                  <div className="text-sm text-muted-foreground">Avg. Rating</div>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="text-2xl font-bold text-foreground">21</div>
                  <div className="text-sm text-muted-foreground">Avg. Days to Sell</div>
                </div>
              </div>
            </div>

            {/* Featured Agents Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {mockAgents.slice(0, 4).map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-2xl overflow-hidden ${index === 0 ? "row-span-2" : ""}`}
                >
                  <img
                    src={agent.image || "/placeholder.svg"}
                    alt={agent.name}
                    className={`w-full object-cover ${index === 0 ? "h-full" : "h-40"}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="text-sm font-medium text-foreground">{agent.rating}</span>
                    </div>
                    <div className="font-semibold text-foreground text-sm">{agent.name}</div>
                    <div className="text-xs text-muted-foreground">{agent.agency.name}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="px-4 md:px-6 lg:px-8 py-8 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-sm text-muted-foreground">License Verified</span>
            </div>
            <div className="flex items-center gap-3">
              <BadgeCheck className="w-6 h-6 text-primary" />
              <span className="text-sm text-muted-foreground">Background Checked</span>
            </div>
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-primary" />
              <span className="text-sm text-muted-foreground">Verified Reviews</span>
            </div>
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-primary" />
              <span className="text-sm text-muted-foreground">Performance Tracked</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 md:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="agents">Find Agents</TabsTrigger>
                <TabsTrigger value="agencies">Browse Agencies</TabsTrigger>
                <TabsTrigger value="appraisal">Get Appraisal</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="sales">Most Sales</SelectItem>
                    <SelectItem value="experience">Most Experience</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-none h-9 w-9"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-none h-9 w-9"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Find Agents Tab */}
            <TabsContent value="agents" className="mt-0">
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-[180px]">
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="melbourne-cbd">Melbourne CBD</SelectItem>
                    <SelectItem value="inner-east">Inner East</SelectItem>
                    <SelectItem value="inner-south">Inner South</SelectItem>
                    <SelectItem value="inner-north">Inner North</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger className="w-[180px]">
                    <Home className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    <SelectItem value="luxury">Luxury Homes</SelectItem>
                    <SelectItem value="apartments">Apartments</SelectItem>
                    <SelectItem value="first-home">First Home Buyers</SelectItem>
                    <SelectItem value="investment">Investment Properties</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>

                <span className="text-sm text-muted-foreground ml-auto">{sortedAgents.length} agents found</span>
              </div>

              {/* Agents Grid */}
              <AnimatePresence mode="wait">
                {viewMode === "grid" ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {sortedAgents.map((agent, index) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        index={index}
                        isSaved={savedAgents.includes(agent.id)}
                        onToggleSave={() => toggleSaved(agent.id)}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {sortedAgents.map((agent, index) => (
                      <AgentListItem
                        key={agent.id}
                        agent={agent}
                        index={index}
                        isSaved={savedAgents.includes(agent.id)}
                        onToggleSave={() => toggleSaved(agent.id)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Agencies Tab */}
            <TabsContent value="agencies" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from(new Set(mockAgents.map((a) => a.agency.id))).map((agencyId) => {
                  const agency = mockAgents.find((a) => a.agency.id === agencyId)?.agency
                  if (!agency) return null
                  return <AgencyCard key={agency.id} agency={agency} />
                })}
              </div>
            </TabsContent>

            {/* Appraisal Tab */}
            <TabsContent value="appraisal" className="mt-0">
              <div className="max-w-2xl mx-auto">
                <Card className="bg-card border-border">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Home className="w-8 h-8 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">Get a Free Property Appraisal</h2>
                      <p className="text-muted-foreground">
                        Receive a comprehensive market appraisal from a top local agent
                      </p>
                    </div>

                    <form className="space-y-6">
                      <div>
                        <Label htmlFor="address">Property Address</Label>
                        <Input id="address" placeholder="Enter your property address" className="mt-1.5" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type">Property Type</Label>
                          <Select>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="townhouse">Townhouse</SelectItem>
                              <SelectItem value="land">Land</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="bedrooms">Bedrooms</Label>
                          <Select>
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Your Name</Label>
                          <Input id="name" placeholder="Full name" className="mt-1.5" />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" placeholder="0400 000 000" className="mt-1.5" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="you@example.com" className="mt-1.5" />
                      </div>

                      <div>
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any additional information about your property..."
                          className="mt-1.5"
                          rows={3}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        size="lg"
                      >
                        Request Free Appraisal
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>

                      <p className="text-xs text-center text-muted-foreground">
                        By submitting, you agree to be contacted by a HAUS verified agent. Your information is secure
                        and never shared.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Join as Agent CTA */}
      <section className="px-4 md:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-card border-border overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-12">
                  <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">For Agents</Badge>
                  <h2 className="text-3xl font-bold text-foreground mb-4">Join Australia's Premier Agent Network</h2>
                  <p className="text-muted-foreground mb-6">
                    Connect with qualified buyers and sellers, access powerful marketing tools, and grow your business
                    with HAUS.AGENCY.
                  </p>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Access to exclusive off-market listings",
                      "Advanced CRM and marketing tools",
                      "Lead generation and qualification",
                      "Professional profile and branding",
                      "Performance analytics dashboard",
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Apply to Join
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline">Learn More</Button>
                  </div>
                </div>

                <div className="relative hidden md:block">
                  <div className="absolute inset-0 bg-gradient-to-r from-card to-transparent z-10" />
                  <img
                    src="/modern-office-interior-law-firm.jpg"
                    alt="Modern office"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

// Agent Card Component
function AgentCard({
  agent,
  index,
  isSaved,
  onToggleSave,
}: {
  agent: Agent
  index: number
  isSaved: boolean
  onToggleSave: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="group bg-card border-border overflow-hidden hover:border-primary/30 transition-all">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={agent.image || "/placeholder.svg"}
              alt={agent.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {agent.hausVerified && (
                <Badge className="bg-primary/90 text-primary-foreground">
                  <BadgeCheck className="w-3 h-3 mr-1" />
                  HAUS Verified
                </Badge>
              )}
            </div>

            {/* Save Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.preventDefault()
                onToggleSave()
              }}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : "text-foreground"}`} />
            </Button>

            {/* Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-semibold text-foreground">{agent.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({agent.reviewCount} reviews)</span>
              </div>
              <h3 className="font-semibold text-lg text-foreground">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">
                {agent.title} at {agent.agency.name}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="p-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{agent.propertiesSold}</div>
                <div className="text-xs text-muted-foreground">Properties Sold</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{agent.avgDaysOnMarket}</div>
                <div className="text-xs text-muted-foreground">Avg. Days</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{agent.listToSaleRatio}%</div>
                <div className="text-xs text-muted-foreground">Sale Rate</div>
              </div>
            </div>

            {/* Specializations */}
            <div className="flex flex-wrap gap-1 mb-4">
              {agent.specializations.slice(0, 3).map((spec, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <Phone className="w-3 h-3 mr-1" />
                Call
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <Mail className="w-3 h-3 mr-1" />
                Email
              </Button>
              <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                View Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Agent List Item Component
function AgentListItem({
  agent,
  index,
  isSaved,
  onToggleSave,
}: {
  agent: Agent
  index: number
  isSaved: boolean
  onToggleSave: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="group bg-card border-border overflow-hidden hover:border-primary/30 transition-all">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="relative w-full md:w-48 aspect-square md:aspect-auto overflow-hidden">
              <img src={agent.image || "/placeholder.svg"} alt={agent.name} className="w-full h-full object-cover" />
              {agent.hausVerified && (
                <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">
                  <BadgeCheck className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-foreground">{agent.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="font-medium text-foreground">{agent.rating}</span>
                      <span className="text-sm text-muted-foreground">({agent.reviewCount})</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {agent.title} at {agent.agency.name}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                    <MapPin className="w-3 h-3" />
                    {agent.serviceAreas.slice(0, 3).join(", ")}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault()
                    onToggleSave()
                  }}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{formatCurrency(agent.totalSales)} total sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{agent.propertiesSold} properties sold</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{agent.avgDaysOnMarket} days avg.</span>
                </div>
              </div>

              {/* Specializations */}
              <div className="flex flex-wrap gap-2 mb-4">
                {agent.specializations.map((spec, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Phone className="w-3 h-3 mr-1" />
                  {agent.phone}
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </Button>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  View Profile
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Agency Card Component
function AgencyCard({ agency }: { agency: Agency }) {
  return (
    <Card className="bg-card border-border overflow-hidden hover:border-primary/30 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{agency.name}</h3>
              {agency.verified && <BadgeCheck className="w-4 h-4 text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground">{agency.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-border">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{agency.totalAgents}</div>
            <div className="text-xs text-muted-foreground">Agents</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{agency.activeListings}</div>
            <div className="text-xs text-muted-foreground">Listings</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="text-lg font-bold text-foreground">{agency.avgRating}</span>
            </div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
        </div>

        {/* Service Areas */}
        <div className="flex flex-wrap gap-1 mb-4">
          {agency.serviceAreas.slice(0, 4).map((area, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {area}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <Phone className="w-3 h-3 mr-1" />
            Contact
          </Button>
          <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            View Agency
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
