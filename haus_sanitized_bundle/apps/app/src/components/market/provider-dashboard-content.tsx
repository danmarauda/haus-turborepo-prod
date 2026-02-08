"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@v1/ui/card"
import { Button } from "@v1/ui/button"
import { Badge } from "@v1/ui/badge"
import { Input } from "@v1/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@v1/ui/tabs"
import { Progress } from "@v1/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@v1/ui/avatar"
import { Switch } from "@v1/ui/switch"
import { Textarea } from "@v1/ui/textarea"
import {
  LayoutDashboard,
  FileText,
  Star,
  DollarSign,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Bell,
  ChevronRight,
  Eye,
  Send,
  AlertCircle,
  Award,
  Shield,
  Edit,
  Upload,
  MapPin,
  Building2,
  BarChart3,
  ArrowUpRight,
  Filter,
  Search,
  MoreHorizontal,
  CheckCheck,
  X,
  Download,
} from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@v1/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@v1/ui/select"

// Mock provider data
const providerData = {
  name: "Sydney Property Conveyancing",
  logo: "/conveyancing-logo-professional.jpg",
  category: "Conveyancing",
  verificationLevel: "elite",
  rating: 4.9,
  reviewCount: 247,
  completedJobs: 1842,
  memberSince: "2019",
  responseTime: "< 2 hours",
}

// Analytics data
const revenueData = [
  { month: "Jul", revenue: 42500, quotes: 28 },
  { month: "Aug", revenue: 48200, quotes: 32 },
  { month: "Sep", revenue: 51800, quotes: 35 },
  { month: "Oct", revenue: 47600, quotes: 31 },
  { month: "Nov", revenue: 55200, quotes: 38 },
  { month: "Dec", revenue: 62400, quotes: 42 },
]

const quoteConversionData = [
  { week: "W1", sent: 12, accepted: 8 },
  { week: "W2", sent: 15, accepted: 11 },
  { week: "W3", sent: 10, accepted: 7 },
  { week: "W4", sent: 14, accepted: 10 },
]

// Active quotes
const activeQuotes = [
  {
    id: "Q-2024-1847",
    customer: "Sarah Mitchell",
    property: "42 Harbour View Dr, Double Bay",
    service: "Conveyancing - Purchase",
    amount: 2800,
    status: "pending",
    date: "2 hours ago",
    urgency: "standard",
  },
  {
    id: "Q-2024-1846",
    customer: "James Chen",
    property: "15 Ocean Ave, Bondi",
    service: "Conveyancing - Sale",
    amount: 2400,
    status: "viewed",
    date: "5 hours ago",
    urgency: "urgent",
  },
  {
    id: "Q-2024-1845",
    customer: "Emily Watson",
    property: "88 Park Rd, Mosman",
    service: "Contract Review",
    amount: 850,
    status: "accepted",
    date: "1 day ago",
    urgency: "standard",
  },
  {
    id: "Q-2024-1844",
    customer: "Michael Brown",
    property: "22 Bay St, Manly",
    service: "Conveyancing - Purchase",
    amount: 2600,
    status: "expired",
    date: "3 days ago",
    urgency: "standard",
  },
]

// Recent reviews
const recentReviews = [
  {
    id: 1,
    customer: "Amanda Taylor",
    avatar: "/professional-woman-headshot.png",
    rating: 5,
    date: "2 days ago",
    comment:
      "Exceptional service throughout our property purchase. The team was professional, responsive, and made the entire process stress-free.",
    property: "First home purchase in Surry Hills",
    responded: true,
  },
  {
    id: 2,
    customer: "David Lee",
    avatar: "/asian-professional-man.png",
    rating: 5,
    date: "5 days ago",
    comment:
      "Very thorough contract review. Identified several issues that saved us from potential problems. Highly recommended!",
    property: "Contract review for Newtown apartment",
    responded: false,
  },
  {
    id: 3,
    customer: "Rachel Green",
    avatar: "/professional-blonde-woman.png",
    rating: 4,
    date: "1 week ago",
    comment: "Good communication and professional service. Settlement was handled smoothly with regular updates.",
    property: "Investment property sale in Parramatta",
    responded: true,
  },
]

// Notifications
const notifications = [
  { id: 1, type: "quote", message: "New quote request from Sarah Mitchell", time: "2 hours ago", read: false },
  { id: 2, type: "review", message: "Amanda Taylor left you a 5-star review", time: "2 days ago", read: false },
  { id: 3, type: "payment", message: "Payment received for Q-2024-1840", time: "3 days ago", read: true },
  { id: 4, type: "reminder", message: "Settlement due tomorrow for 15 Ocean Ave", time: "4 days ago", read: true },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    case "viewed":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "accepted":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    case "expired":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "declined":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

export function ProviderDashboardContent() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [quoteFilter, setQuoteFilter] = useState("all")
  const [responseText, setResponseText] = useState("")
  const [respondingTo, setRespondingTo] = useState<number | null>(null)

  // Calculate stats
  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.revenue, 0)
  const totalQuotes = revenueData.reduce((acc, curr) => acc + curr.quotes, 0)
  const avgQuoteValue = totalRevenue / totalQuotes
  const conversionRate = 72

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={providerData.logo || "/placeholder.svg"}
              alt={providerData.name}
              className="w-16 h-16 rounded-2xl object-cover border border-white/10"
            />
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{providerData.name}</h1>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <Award className="w-3 h-3 mr-1" />
                Elite
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary fill-primary" />
                {providerData.rating} ({providerData.reviewCount} reviews)
              </span>
              <span>•</span>
              <span>{providerData.completedJobs} jobs completed</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 hover:bg-white/10 bg-transparent">
            <Eye className="w-4 h-4 mr-2" />
            View Profile
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-white/10 hover:bg-white/10 bg-transparent relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
                  2
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-black/95 border-white/10">
              <div className="p-2">
                <p className="text-sm font-medium mb-2">Notifications</p>
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-2 rounded-lg mb-1 ${notif.read ? "opacity-60" : "bg-white/5"}`}>
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-muted-foreground">{notif.time}</p>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 rounded-full p-1 flex-wrap h-auto gap-1">
          <TabsTrigger
            value="overview"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="quotes"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="w-4 h-4 mr-2" />
            Quotes
            <Badge variant="secondary" className="ml-2 bg-white/10">
              4
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Star className="w-4 h-4 mr-2" />
            Reviews
          </TabsTrigger>
          <TabsTrigger
            value="earnings"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Earnings
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border bg-card backdrop-blur dark:border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +12%
                  </Badge>
                </div>
                <p className="text-2xl font-bold mt-3">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">Revenue (6 months)</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card backdrop-blur dark:border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +8%
                  </Badge>
                </div>
                <p className="text-2xl font-bold mt-3">{totalQuotes}</p>
                <p className="text-sm text-muted-foreground">Quotes Sent</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card backdrop-blur dark:border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    +5%
                  </Badge>
                </div>
                <p className="text-2xl font-bold mt-3">{conversionRate}%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card backdrop-blur dark:border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Clock className="w-5 h-5 text-purple-500" />
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Fast</Badge>
                </div>
                <p className="text-2xl font-bold mt-3">{providerData.responseTime}</p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="border-border bg-card backdrop-blur dark:border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Revenue Overview
                    </CardTitle>
                    <CardDescription>Monthly revenue and quote volume</CardDescription>
                  </div>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-24 bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="90d">90 days</SelectItem>
                      <SelectItem value="1y">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C9A962" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#C9A962" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                        formatter={(value) => [formatCurrency(typeof value === 'number' ? value : 0), "Revenue"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#C9A962"
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quote Conversion Chart */}
            <Card className="border-border bg-card backdrop-blur dark:border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Quote Conversion
                </CardTitle>
                <CardDescription>Quotes sent vs accepted this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quoteConversionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                      />
                      <Bar dataKey="sent" name="Sent" fill="rgba(255,255,255,0.2)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="accepted" name="Accepted" fill="#C9A962" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <span className="text-sm text-muted-foreground">Sent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm text-muted-foreground">Accepted</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Quotes */}
            <Card className="border-border bg-card backdrop-blur dark:border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Quote Requests</CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeQuotes.slice(0, 3).map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">{quote.customer}</span>
                        <Badge className={getStatusColor(quote.status)} variant="outline">
                          {quote.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{quote.property}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium text-foreground">{formatCurrency(quote.amount)}</p>
                      <p className="text-xs text-muted-foreground">{quote.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card className="border-border bg-card backdrop-blur dark:border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Reviews</CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="p-3 rounded-xl bg-muted">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={review.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{review.customer.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{review.customer}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.rating ? "text-primary fill-primary" : "text-muted-foreground/20"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="space-y-6">
          {/* Quote Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search quotes..." className="pl-9 w-64 bg-white/5 border-white/10" />
              </div>
              <Select value={quoteFilter} onValueChange={setQuoteFilter}>
                <SelectTrigger className="w-36 bg-white/5 border-white/10">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/10">
                  <SelectItem value="all">All Quotes</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Send className="w-4 h-4 mr-2" />
              Create Quote
            </Button>
          </div>

          {/* Quotes List */}
          <Card className="border-white/10 bg-black/60 backdrop-blur">
            <CardContent className="p-0">
              <div className="divide-y divide-white/10">
                {activeQuotes.map((quote) => (
                  <div key={quote.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-muted-foreground">{quote.id}</span>
                          <Badge className={getStatusColor(quote.status)}>{quote.status}</Badge>
                          {quote.urgency === "urgent" && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-lg">{quote.customer}</h4>
                        <p className="text-muted-foreground">{quote.service}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {quote.property}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{formatCurrency(quote.amount)}</p>
                          <p className="text-sm text-muted-foreground">{quote.date}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-white/10">
                              <MoreHorizontal className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-black/95 border-white/10">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Quote
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="w-4 h-4 mr-2" />
                              Resend
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400">
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          {/* Review Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-white/10 bg-black/60 backdrop-blur">
              <CardContent className="p-4 text-center">
                <div className="text-4xl font-bold text-primary">{providerData.rating}</div>
                <div className="flex justify-center gap-1 my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Overall Rating</p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-black/60 backdrop-blur">
              <CardContent className="p-4 text-center">
                <div className="text-4xl font-bold">{providerData.reviewCount}</div>
                <p className="text-sm text-muted-foreground mt-2">Total Reviews</p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-black/60 backdrop-blur">
              <CardContent className="p-4 text-center">
                <div className="text-4xl font-bold text-emerald-400">94%</div>
                <p className="text-sm text-muted-foreground mt-2">Response Rate</p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-black/60 backdrop-blur">
              <CardContent className="p-4 text-center">
                <div className="text-4xl font-bold text-blue-400">12</div>
                <p className="text-sm text-muted-foreground mt-2">This Month</p>
              </CardContent>
            </Card>
          </div>

          {/* Rating Breakdown */}
          <Card className="border-white/10 bg-black/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Rating Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { stars: 5, count: 198, percentage: 80 },
                  { stars: 4, count: 37, percentage: 15 },
                  { stars: 3, count: 8, percentage: 3 },
                  { stars: 2, count: 3, percentage: 1 },
                  { stars: 1, count: 1, percentage: 1 },
                ].map((rating) => (
                  <div key={rating.stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm">{rating.stars}</span>
                      <Star className="w-3 h-3 text-primary fill-primary" />
                    </div>
                    <Progress value={rating.percentage} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-12">{rating.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <Card key={review.id} className="border-white/10 bg-black/60 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={review.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{review.customer[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{review.customer}</h4>
                          <p className="text-sm text-muted-foreground">{review.property}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "text-primary fill-primary" : "text-white/20"}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{review.date}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>

                      {review.responded ? (
                        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
                              <CheckCheck className="w-3 h-3 mr-1" />
                              Your Response
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Thank you so much for your kind words! It was a pleasure working with you on your property
                            purchase.
                          </p>
                        </div>
                      ) : respondingTo === review.id ? (
                        <div className="mt-4 space-y-3">
                          <Textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Write your response..."
                            className="bg-white/5 border-white/10"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                              onClick={() => {
                                setRespondingTo(null)
                                setResponseText("")
                              }}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Post Response
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setRespondingTo(null)
                                setResponseText("")
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-4 border-white/10 hover:bg-white/10 bg-transparent"
                          onClick={() => setRespondingTo(review.id)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Respond to Review
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-6">
          {/* Earnings Overview */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="border-white/10 bg-black/60 backdrop-blur lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Earnings Overview
                </CardTitle>
                <CardDescription>Your revenue over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C9A962" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#C9A962" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                        }}
                        formatter={(value) => [formatCurrency(typeof value === 'number' ? value : 0), "Revenue"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#C9A962"
                        strokeWidth={2}
                        fill="url(#earningsGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Earnings Summary */}
            <Card className="border-white/10 bg-black/60 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
                  <p className="text-sm text-emerald-400 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4" />
                    +12% vs last period
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                    <span className="text-muted-foreground">Average Job Value</span>
                    <span className="font-semibold">{formatCurrency(avgQuoteValue)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                    <span className="text-muted-foreground">Jobs Completed</span>
                    <span className="font-semibold">{totalQuotes}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                    <span className="text-muted-foreground">Pending Payments</span>
                    <span className="font-semibold text-amber-400">{formatCurrency(8400)}</span>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="border-white/10 bg-black/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: "TXN-001", customer: "Emily Watson", amount: 2800, status: "completed", date: "Dec 18, 2024" },
                  { id: "TXN-002", customer: "James Chen", amount: 2400, status: "pending", date: "Dec 15, 2024" },
                  { id: "TXN-003", customer: "Sarah Mitchell", amount: 850, status: "completed", date: "Dec 12, 2024" },
                  { id: "TXN-004", customer: "Michael Brown", amount: 2600, status: "completed", date: "Dec 8, 2024" },
                ].map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${txn.status === "completed" ? "bg-emerald-500/20" : "bg-amber-500/20"}`}
                      >
                        {txn.status === "completed" ? (
                          <CheckCircle2
                            className={`w-5 h-5 ${txn.status === "completed" ? "text-emerald-500" : "text-amber-500"}`}
                          />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{txn.customer}</p>
                        <p className="text-sm text-muted-foreground">
                          {txn.id} • {txn.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{formatCurrency(txn.amount)}</p>
                      <Badge
                        className={
                          txn.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }
                      >
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Settings */}
            <Card className="border-white/10 bg-black/60 backdrop-blur lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Business Profile
                </CardTitle>
                <CardDescription>Manage your public profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="flex items-center gap-4">
                  <img
                    src={providerData.logo || "/placeholder.svg"}
                    alt="Logo"
                    className="w-20 h-20 rounded-2xl object-cover border border-white/10"
                  />
                  <div>
                    <Button variant="outline" className="border-white/10 hover:bg-white/10 bg-transparent">
                      <Upload className="w-4 h-4 mr-2" />
                      Change Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 2MB</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Business Name</label>
                    <Input defaultValue={providerData.name} className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select defaultValue="conveyancing">
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 border-white/10">
                        <SelectItem value="conveyancing">Conveyancing</SelectItem>
                        <SelectItem value="legal">Legal Services</SelectItem>
                        <SelectItem value="inspection">Building Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input defaultValue="(02) 9555 1234" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input defaultValue="contact@sydneyconveyancing.com.au" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input defaultValue="https://sydneyconveyancing.com.au" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">About</label>
                    <Textarea
                      defaultValue="Sydney Property Conveyancing is a leading conveyancing firm with over 15 years of experience in residential and commercial property transactions across NSW."
                      className="bg-white/5 border-white/10 min-h-[100px]"
                    />
                  </div>
                </div>

                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Changes</Button>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <div className="space-y-6">
              <Card className="border-white/10 bg-black/60 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                    <Award className="w-12 h-12 text-primary mx-auto mb-2" />
                    <h3 className="font-bold text-lg">Elite Provider</h3>
                    <p className="text-sm text-muted-foreground">Highest verification level</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "Business Registration", verified: true },
                      { label: "Professional License", verified: true },
                      { label: "Insurance Coverage", verified: true },
                      { label: "Background Check", verified: true },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                        <span className="text-sm">{item.label}</span>
                        {item.verified ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card className="border-white/10 bg-black/60 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg">Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">New quotes and reviews</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Alerts</p>
                      <p className="text-sm text-muted-foreground">Urgent quote requests</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-muted-foreground">Show on marketplace</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
