"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@haus/ui/card"
import { Button } from "@haus/ui/button"
import { Badge } from "@haus/ui/badge"
import { Input } from "@haus/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@haus/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@haus/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  BarChart3,
  LineChart,
  Activity,
  Clock,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Bell,
  Download,
  Share2,
  ChevronRight,
  Zap,
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock data for charts
const priceHistoryData = [
  { month: "Jan", sydney: 1250000, melbourne: 980000, brisbane: 720000, perth: 580000 },
  { month: "Feb", sydney: 1280000, melbourne: 995000, brisbane: 735000, perth: 590000 },
  { month: "Mar", sydney: 1310000, melbourne: 1010000, brisbane: 755000, perth: 605000 },
  { month: "Apr", sydney: 1295000, melbourne: 1025000, brisbane: 780000, perth: 615000 },
  { month: "May", sydney: 1340000, melbourne: 1040000, brisbane: 810000, perth: 630000 },
  { month: "Jun", sydney: 1380000, melbourne: 1055000, brisbane: 835000, perth: 648000 },
  { month: "Jul", sydney: 1420000, melbourne: 1070000, brisbane: 860000, perth: 665000 },
  { month: "Aug", sydney: 1455000, melbourne: 1085000, brisbane: 890000, perth: 680000 },
  { month: "Sep", sydney: 1490000, melbourne: 1100000, brisbane: 915000, perth: 695000 },
  { month: "Oct", sydney: 1520000, melbourne: 1115000, brisbane: 940000, perth: 710000 },
  { month: "Nov", sydney: 1555000, melbourne: 1130000, brisbane: 965000, perth: 725000 },
  { month: "Dec", sydney: 1590000, melbourne: 1145000, brisbane: 990000, perth: 740000 },
]

const auctionData = [
  { week: "Week 1", clearance: 72, listings: 845 },
  { week: "Week 2", clearance: 68, listings: 912 },
  { week: "Week 3", clearance: 75, listings: 878 },
  { week: "Week 4", clearance: 71, listings: 956 },
  { week: "Week 5", clearance: 78, listings: 1024 },
  { week: "Week 6", clearance: 74, listings: 989 },
  { week: "Week 7", clearance: 76, listings: 1056 },
  { week: "Week 8", clearance: 73, listings: 1102 },
]

const propertyTypeDistribution = [
  { name: "Houses", value: 45, color: "#C9A962" },
  { name: "Apartments", value: 30, color: "#8B7355" },
  { name: "Townhouses", value: 15, color: "#6B5B4F" },
  { name: "Land", value: 7, color: "#4A4035" },
  { name: "Commercial", value: 3, color: "#2D2620" },
]

const rentalYieldData = [
  { suburb: "Parramatta", houses: 3.2, apartments: 4.8 },
  { suburb: "Southbank", houses: 2.8, apartments: 4.5 },
  { suburb: "Fortitude Valley", houses: 3.5, apartments: 5.2 },
  { suburb: "Fremantle", houses: 3.8, apartments: 4.9 },
  { suburb: "North Adelaide", houses: 3.1, apartments: 4.6 },
  { suburb: "Hobart CBD", houses: 4.2, apartments: 5.8 },
]

const daysOnMarketData = [
  { month: "Jul", sydney: 28, melbourne: 32, brisbane: 24, perth: 22 },
  { month: "Aug", sydney: 26, melbourne: 30, brisbane: 22, perth: 20 },
  { month: "Sep", sydney: 25, melbourne: 28, brisbane: 21, perth: 19 },
  { month: "Oct", sydney: 24, melbourne: 27, brisbane: 20, perth: 18 },
  { month: "Nov", sydney: 23, melbourne: 26, brisbane: 19, perth: 17 },
  { month: "Dec", sydney: 22, melbourne: 25, brisbane: 18, perth: 16 },
]

// Top suburbs data
const topSuburbs = [
  { name: "Mosman, NSW", medianPrice: 4250000, change: 8.5, listings: 45 },
  { name: "Toorak, VIC", medianPrice: 3850000, change: 6.2, listings: 38 },
  { name: "New Farm, QLD", medianPrice: 2150000, change: 12.4, listings: 52 },
  { name: "Cottesloe, WA", medianPrice: 2450000, change: 9.8, listings: 28 },
  { name: "Unley, SA", medianPrice: 1650000, change: 7.1, listings: 34 },
  { name: "Battery Point, TAS", medianPrice: 1250000, change: 15.2, listings: 18 },
]

// Market insights/news
const marketInsights = [
  {
    id: 1,
    title: "Sydney auction clearance rates hit 12-month high",
    category: "Auctions",
    date: "2 hours ago",
    trend: "up",
  },
  {
    id: 2,
    title: "Brisbane leads national price growth for Q4",
    category: "Prices",
    date: "5 hours ago",
    trend: "up",
  },
  {
    id: 3,
    title: "Melbourne rental vacancy rates drop to 1.2%",
    category: "Rentals",
    date: "1 day ago",
    trend: "down",
  },
  {
    id: 4,
    title: "Interest rate pause fuels buyer confidence",
    category: "Economy",
    date: "2 days ago",
    trend: "up",
  },
]

// Time period options
const timePeriods = [
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "5y", label: "5Y" },
  { value: "all", label: "All" },
]

export function MarketContent() {
  const [selectedPeriod, setSelectedPeriod] = useState("1y")
  const [selectedCity, setSelectedCity] = useState("all")
  const [searchSuburb, setSearchSuburb] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`
    }
    return `$${(price / 1000).toFixed(0)}K`
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-black/80 backdrop-blur shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_12px_24px_-12px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
          <div className="relative p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Live Market Data</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground">
                  Market Analytics
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  Real-time insights into the Australian property market. Track price trends, auction results, rental
                  yields, and make data-driven investment decisions.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="rounded-full border-white/10 bg-transparent gap-2">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Set Alert</span>
                </Button>
                <Button variant="outline" size="sm" className="rounded-full border-white/10 bg-transparent gap-2">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Button variant="outline" size="sm" className="rounded-full border-white/10 bg-transparent gap-2">
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search suburb or postcode..."
                  value={searchSuburb}
                  onChange={(e) => setSearchSuburb(e.target.value)}
                  className="pl-12 h-12 rounded-full bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full sm:w-48 h-12 rounded-full bg-white/5 border-white/10">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="sydney">Sydney</SelectItem>
                  <SelectItem value="melbourne">Melbourne</SelectItem>
                  <SelectItem value="brisbane">Brisbane</SelectItem>
                  <SelectItem value="perth">Perth</SelectItem>
                  <SelectItem value="adelaide">Adelaide</SelectItem>
                  <SelectItem value="hobart">Hobart</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1 bg-white/5 rounded-full p-1 border border-white/10">
                {timePeriods.map((period) => (
                  <Button
                    key={period.value}
                    variant="ghost"
                    size="sm"
                    className={`rounded-full px-4 ${
                      selectedPeriod === period.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setSelectedPeriod(period.value)}
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Overview */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-white/10 bg-black/60 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  5.2%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">National Median</p>
                <p className="text-2xl font-semibold text-foreground">$892,500</p>
                <p className="text-xs text-muted-foreground">vs $848,200 last year</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/60 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 flex items-center justify-center">
                  <Percent className="w-5 h-5 text-blue-400" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  3.1%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Clearance Rate</p>
                <p className="text-2xl font-semibold text-foreground">74.2%</p>
                <p className="text-xs text-muted-foreground">1,245 auctions this week</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/60 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-violet-400" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                  -4 days
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Days on Market</p>
                <p className="text-2xl font-semibold text-foreground">26 days</p>
                <p className="text-xs text-muted-foreground">National average</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/60 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-orange-400" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  12.4%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">New Listings</p>
                <p className="text-2xl font-semibold text-foreground">48,250</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Charts Section */}
      <section className="mb-8">
        <Tabs defaultValue="prices" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 rounded-full p-1">
            <TabsTrigger
              value="prices"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <LineChart className="w-4 h-4 mr-2" />
              Price Trends
            </TabsTrigger>
            <TabsTrigger
              value="auctions"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Auctions
            </TabsTrigger>
            <TabsTrigger
              value="yields"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Rental Yields
            </TabsTrigger>
            <TabsTrigger
              value="dom"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Clock className="w-4 h-4 mr-2" />
              Days on Market
            </TabsTrigger>
          </TabsList>

          {/* Price Trends Tab */}
          <TabsContent value="prices">
            <Card className="border-white/10 bg-black/60 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Median House Prices</CardTitle>
                    <CardDescription>Capital city price trends over the past 12 months</CardDescription>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#C9A962]" />
                      <span className="text-muted-foreground">Sydney</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#8B7355]" />
                      <span className="text-muted-foreground">Melbourne</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#6B9B76]" />
                      <span className="text-muted-foreground">Brisbane</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#7B8CDE]" />
                      <span className="text-muted-foreground">Perth</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceHistoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="sydneyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C9A962" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#C9A962" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="melbourneGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B7355" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8B7355" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="brisbaneGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6B9B76" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6B9B76" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="perthGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7B8CDE" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#7B8CDE" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                      <YAxis
                        stroke="rgba(255,255,255,0.5)"
                        fontSize={12}
                        tickFormatter={(value) => formatPrice(value)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          padding: "12px",
                        }}
                        labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                        formatter={(value) => [formatPrice(typeof value === 'number' ? value : 0), ""]}
                      />
                      <Area
                        type="monotone"
                        dataKey="sydney"
                        stroke="#C9A962"
                        strokeWidth={2}
                        fill="url(#sydneyGradient)"
                        name="Sydney"
                      />
                      <Area
                        type="monotone"
                        dataKey="melbourne"
                        stroke="#8B7355"
                        strokeWidth={2}
                        fill="url(#melbourneGradient)"
                        name="Melbourne"
                      />
                      <Area
                        type="monotone"
                        dataKey="brisbane"
                        stroke="#6B9B76"
                        strokeWidth={2}
                        fill="url(#brisbaneGradient)"
                        name="Brisbane"
                      />
                      <Area
                        type="monotone"
                        dataKey="perth"
                        stroke="#7B8CDE"
                        strokeWidth={2}
                        fill="url(#perthGradient)"
                        name="Perth"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auctions Tab */}
          <TabsContent value="auctions">
            <Card className="border-white/10 bg-black/60 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Auction Performance</CardTitle>
                    <CardDescription>Weekly clearance rates and listing volumes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={auctionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                      <YAxis
                        yAxisId="left"
                        stroke="rgba(255,255,255,0.5)"
                        fontSize={12}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          padding: "12px",
                        }}
                        labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="listings"
                        fill="rgba(139,115,85,0.5)"
                        radius={[4, 4, 0, 0]}
                        name="Listings"
                      />
                      <Bar yAxisId="left" dataKey="clearance" fill="#C9A962" radius={[4, 4, 0, 0]} name="Clearance %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rental Yields Tab */}
          <TabsContent value="yields">
            <Card className="border-white/10 bg-black/60 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Rental Yields by Suburb</CardTitle>
                    <CardDescription>Gross rental yields for houses and apartments</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={rentalYieldData}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        type="number"
                        stroke="rgba(255,255,255,0.5)"
                        fontSize={12}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <YAxis type="category" dataKey="suburb" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          padding: "12px",
                        }}
                        labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                        formatter={(value) => [`${value ?? 0}%`, ""]}
                      />
                      <Bar dataKey="houses" fill="#C9A962" radius={[0, 4, 4, 0]} name="Houses" />
                      <Bar dataKey="apartments" fill="#7B8CDE" radius={[0, 4, 4, 0]} name="Apartments" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Days on Market Tab */}
          <TabsContent value="dom">
            <Card className="border-white/10 bg-black/60 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Average Days on Market</CardTitle>
                    <CardDescription>Time to sell by capital city</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={daysOnMarketData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickFormatter={(value) => `${value}d`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          padding: "12px",
                        }}
                        labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                        formatter={(value) => [`${value ?? 0} days`, ""]}
                      />
                      <Line
                        type="monotone"
                        dataKey="sydney"
                        stroke="#C9A962"
                        strokeWidth={2}
                        dot={{ fill: "#C9A962", strokeWidth: 0 }}
                        name="Sydney"
                      />
                      <Line
                        type="monotone"
                        dataKey="melbourne"
                        stroke="#8B7355"
                        strokeWidth={2}
                        dot={{ fill: "#8B7355", strokeWidth: 0 }}
                        name="Melbourne"
                      />
                      <Line
                        type="monotone"
                        dataKey="brisbane"
                        stroke="#6B9B76"
                        strokeWidth={2}
                        dot={{ fill: "#6B9B76", strokeWidth: 0 }}
                        name="Brisbane"
                      />
                      <Line
                        type="monotone"
                        dataKey="perth"
                        stroke="#7B8CDE"
                        strokeWidth={2}
                        dot={{ fill: "#7B8CDE", strokeWidth: 0 }}
                        name="Perth"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Secondary Data Section */}
      <section className="mb-8 grid lg:grid-cols-3 gap-6">
        {/* Property Type Distribution */}
        <Card className="border-white/10 bg-black/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Property Distribution</CardTitle>
            <CardDescription>Current listings by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {propertyTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      padding: "12px",
                    }}
                    formatter={(value) => [`${value ?? 0}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {propertyTypeDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-foreground font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Suburbs */}
        <Card className="border-white/10 bg-black/60 backdrop-blur lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Top Performing Suburbs</CardTitle>
                <CardDescription>Highest price growth this quarter</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1">
                View all
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSuburbs.map((suburb, index) => (
                <div
                  key={suburb.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{suburb.name}</p>
                      <p className="text-sm text-muted-foreground">{suburb.listings} listings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatPrice(suburb.medianPrice)}</p>
                    <div className="flex items-center justify-end gap-1 text-emerald-400 text-sm">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>+{suburb.change}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Market Insights & News */}
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-black/80 backdrop-blur shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_12px_24px_-12px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
          <div className="relative p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-medium tracking-tight text-foreground">Market Insights</h2>
                  <p className="text-sm text-muted-foreground">Latest news and analysis</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1">
                View all insights
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs border-white/10 bg-white/5">
                      {insight.category}
                    </Badge>
                    {insight.trend === "up" ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                  <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {insight.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{insight.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Market Alerts CTA */}
      <section>
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="absolute inset-0 pointer-events-none bg-[url('/abstract-geometric-pattern.png')] opacity-5" />
          <div className="relative p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Bell className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground">Stay Ahead of the Market</h3>
                <p className="text-muted-foreground">
                  Get personalized alerts for price changes, new listings, and market trends
                </p>
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
              <Bell className="w-4 h-4 mr-2" />
              Set Up Alerts
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
