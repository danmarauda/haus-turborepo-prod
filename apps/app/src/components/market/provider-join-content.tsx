"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@haus/ui/button"
import { Card, CardContent } from "@haus/ui/card"
import { Input } from "@haus/ui/input"
import { Label } from "@haus/ui/label"
import { Textarea } from "@haus/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@haus/ui/select"
import { Checkbox } from "@haus/ui/checkbox"
import {
  Shield,
  CheckCircle2,
  Users,
  TrendingUp,
  BadgeCheck,
  ArrowRight,
  FileText,
  DollarSign,
  ChevronLeft,
} from "lucide-react"

const serviceCategories = [
  { id: "conveyancing", label: "Conveyancing" },
  { id: "legal", label: "Property Lawyers" },
  { id: "building-inspection", label: "Building Inspections" },
  { id: "pest-inspection", label: "Pest Inspections" },
  { id: "mortgage-broker", label: "Mortgage Brokers" },
  { id: "removalists", label: "Removalists" },
  { id: "photography", label: "Property Photography" },
  { id: "styling", label: "Property Styling" },
  { id: "repairs", label: "Pre-sale Repairs" },
  { id: "cleaning", label: "Cleaning Services" },
  { id: "buyers-agent", label: "Buyer's Agents" },
  { id: "property-management", label: "Property Management" },
]

const benefits = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Access Qualified Leads",
    description: "Connect with property buyers and sellers actively seeking your services",
  },
  {
    icon: <BadgeCheck className="w-6 h-6" />,
    title: "HAUS Verified Badge",
    description: "Stand out with our trusted verification that builds customer confidence",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Grow Your Business",
    description: "Increase visibility and win more jobs through our platform",
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "No Upfront Fees",
    description: "Only pay when you win work - no monthly subscriptions required",
  },
]

const stats = [
  { value: "50,000+", label: "Jobs Completed" },
  { value: "2,500+", label: "Verified Providers" },
  { value: "4.8/5", label: "Average Rating" },
  { value: "$2.5M+", label: "Earned by Partners" },
]

export function ProviderJoinContent() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    category: "",
    abn: "",
    suburb: "",
    state: "",
    postcode: "",
    serviceAreas: "",
    description: "",
    website: "",
    experience: "",
    hasInsurance: false,
    hasLicense: false,
    agreeTerms: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Application Submitted!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for applying to join the HAUS Marketplace. Our team will review your application and get back to
            you within 2-3 business days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/market">
              <Button variant="outline" className="rounded-full bg-transparent">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
            <Link href="/">
              <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                Go to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Shield className="w-3.5 h-3.5" />
              <span>Partner Program</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
              Grow Your Business with HAUS
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join Australia&apos;s fastest-growing property services marketplace and connect with thousands of
              qualified leads every month.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-2xl bg-card border border-border">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Partner with HAUS?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We&apos;re committed to helping property service providers succeed
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-[32px] border border-border bg-card">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

            <div className="relative z-10 p-8 md:p-12">
              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                    </div>
                    {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-border"}`} />}
                  </div>
                ))}
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  {step === 1 && "Business Information"}
                  {step === 2 && "Service Details"}
                  {step === 3 && "Verification"}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {step === 1 && "Tell us about your business"}
                  {step === 2 && "What services do you offer?"}
                  {step === 3 && "Complete your verification"}
                </p>
              </div>

              {/* Step 1: Business Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        placeholder="Your Business Pty Ltd"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange("businessName", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="abn">ABN *</Label>
                      <Input
                        id="abn"
                        placeholder="12 345 678 901"
                        value={formData.abn}
                        onChange={(e) => handleInputChange("abn", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        placeholder="John Smith"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange("contactName", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@business.com.au"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        placeholder="0400 000 000"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        placeholder="https://yourbusiness.com.au"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="suburb">Suburb *</Label>
                      <Input
                        id="suburb"
                        placeholder="Sydney"
                        value={formData.suburb}
                        onChange={(e) => handleInputChange("suburb", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nsw">NSW</SelectItem>
                          <SelectItem value="vic">VIC</SelectItem>
                          <SelectItem value="qld">QLD</SelectItem>
                          <SelectItem value="wa">WA</SelectItem>
                          <SelectItem value="sa">SA</SelectItem>
                          <SelectItem value="tas">TAS</SelectItem>
                          <SelectItem value="act">ACT</SelectItem>
                          <SelectItem value="nt">NT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Postcode *</Label>
                      <Input
                        id="postcode"
                        placeholder="2000"
                        value={formData.postcode}
                        onChange={(e) => handleInputChange("postcode", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Service Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Service Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select your primary service" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceAreas">Service Areas *</Label>
                    <Input
                      id="serviceAreas"
                      placeholder="e.g., Sydney Metro, Inner West, Eastern Suburbs"
                      value={formData.serviceAreas}
                      onChange={(e) => handleInputChange("serviceAreas", e.target.value)}
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">Separate multiple areas with commas</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <Select
                      value={formData.experience}
                      onValueChange={(value) => handleInputChange("experience", value)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2">1-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Business Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell potential customers about your business, experience, and what makes you different..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="min-h-[120px] rounded-xl"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)} className="rounded-full">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Verification */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <h3 className="font-medium text-foreground mb-2">Required Documents</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You&apos;ll need to provide these documents during the verification process:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Professional license or registration (if applicable)
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Public liability insurance certificate
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Professional indemnity insurance (if applicable)
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="hasLicense"
                        checked={formData.hasLicense}
                        onCheckedChange={(checked) => handleInputChange("hasLicense", checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="hasLicense" className="text-foreground cursor-pointer">
                          I have the required professional licenses for my service category
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="hasInsurance"
                        checked={formData.hasInsurance}
                        onCheckedChange={(checked) => handleInputChange("hasInsurance", checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="hasInsurance" className="text-foreground cursor-pointer">
                          I have current public liability insurance
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="agreeTerms" className="text-foreground cursor-pointer">
                          I agree to the HAUS Partner{" "}
                          <Link href="#" className="text-primary hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="#" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)} className="rounded-full">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!formData.agreeTerms || isSubmitting}
                      className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 mb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              {
                q: "How much does it cost to join?",
                a: "There are no upfront fees or monthly subscriptions. We only charge a small commission when you successfully complete a job through our platform.",
              },
              {
                q: "How long does verification take?",
                a: "Most applications are reviewed within 2-3 business days. Once approved, you'll receive your HAUS Verified badge and can start receiving leads immediately.",
              },
              {
                q: "What documents do I need?",
                a: "You'll need your ABN, professional licenses (if applicable), and current insurance certificates. Our team will guide you through the process.",
              },
              {
                q: "How do I receive job leads?",
                a: "You'll receive notifications when customers request quotes in your service area. You can respond directly through our platform and manage all communications in one place.",
              },
            ].map((faq) => (
              <div key={faq.q} className="p-6 rounded-2xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
