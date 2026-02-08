"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@v1/ui/card"
import { Button } from "@v1/ui/button"
import { Badge } from "@v1/ui/badge"
import { Input } from "@v1/ui/input"
import { Label } from "@v1/ui/label"
import { Textarea } from "@v1/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@v1/ui/radio-group"
import { Checkbox } from "@v1/ui/checkbox"
import { Progress } from "@v1/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@v1/ui/select"
import {
  Shield,
  ShieldCheck,
  Star,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Home,
  Calendar,
  Clock,
  FileText,
  Users,
  Zap,
  Upload,
  X,
  Building2,
  Sparkles,
  MessageSquare,
  Check,
} from "lucide-react"
import Link from "next/link"
import type { ServiceCategory } from "@/types/marketplace"

// Service categories for selection
const serviceCategories = [
  { id: "conveyancing", name: "Conveyancing", icon: FileText, description: "Property transfer & settlement" },
  { id: "buyers-agent", name: "Buyer's Agent", icon: Users, description: "Property search & negotiation" },
  { id: "property-lawyer", name: "Property Lawyer", icon: FileText, description: "Legal advice & contracts" },
  { id: "building-inspection", name: "Building Inspection", icon: Home, description: "Pre-purchase inspections" },
  { id: "pest-inspection", name: "Pest Inspection", icon: Home, description: "Termite & pest checks" },
  { id: "mortgage-broker", name: "Mortgage Broker", icon: Building2, description: "Home loan comparison" },
  { id: "removalist", name: "Removalist", icon: Home, description: "Moving services" },
  { id: "styling", name: "Property Styling", icon: Sparkles, description: "Staging for sale" },
  { id: "photography", name: "Photography", icon: Home, description: "Real estate photos & video" },
  { id: "valuation", name: "Valuation", icon: Building2, description: "Property appraisals" },
  { id: "cleaning", name: "Cleaning", icon: Sparkles, description: "End of lease & deep clean" },
  { id: "renovation", name: "Renovation", icon: Home, description: "Home improvements" },
]

// Property types
const propertyTypes = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "rural", label: "Rural/Acreage" },
]

// Timeline options
const timelineOptions = [
  { value: "urgent", label: "Urgent (within 48 hours)", icon: Zap },
  { value: "this-week", label: "This week", icon: Calendar },
  { value: "next-week", label: "Next week", icon: Calendar },
  { value: "flexible", label: "Flexible / No rush", icon: Clock },
]

// Mock recommended providers
const recommendedProviders = [
  {
    id: "1",
    name: "Settle Smart Conveyancing",
    rating: 4.9,
    reviews: 847,
    responseTime: "< 1 hour",
    verified: "elite",
    logo: "/conveyancing-logo-professional.jpg",
  },
  {
    id: "2",
    name: "QuickConvey Sydney",
    rating: 4.8,
    reviews: 523,
    responseTime: "< 2 hours",
    verified: "premium",
    logo: "/conveyancing-logo.jpg",
  },
  {
    id: "3",
    name: "Premier Legal Conveyancing",
    rating: 4.7,
    reviews: 412,
    responseTime: "< 1 hour",
    verified: "verified",
    logo: "/legal-logo.jpg",
  },
]

type Step = 1 | 2 | 3 | 4

export function QuoteRequestContent() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [formData, setFormData] = useState({
    // Step 1: Service Selection
    serviceCategory: "" as ServiceCategory | "",

    // Step 2: Property Details
    propertyAddress: "",
    propertySuburb: "",
    propertyState: "",
    propertyPostcode: "",
    propertyType: "",
    transactionType: "" as "buying" | "selling" | "other" | "",

    // Step 3: Requirements
    description: "",
    timeline: "",
    budget: "",
    attachments: [] as File[],

    // Step 4: Contact & Provider Selection
    name: "",
    email: "",
    phone: "",
    preferredContact: "email" as "email" | "phone" | "either",
    selectedProviders: [] as string[],
    sendToAll: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const progress = (currentStep / 4) * 100

  const updateFormData = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setIsComplete(true)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    updateFormData("attachments", [...formData.attachments, ...files])
  }

  const removeFile = (index: number) => {
    const newFiles = formData.attachments.filter((_, i) => i !== index)
    updateFormData("attachments", newFiles)
  }

  const toggleProvider = (providerId: string) => {
    const current = formData.selectedProviders
    if (current.includes(providerId)) {
      updateFormData(
        "selectedProviders",
        current.filter((id) => id !== providerId),
      )
    } else {
      updateFormData("selectedProviders", [...current, providerId])
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.serviceCategory !== ""
      case 2:
        return formData.propertyAddress && formData.propertySuburb && formData.propertyState && formData.propertyType
      case 3:
        return formData.description && formData.timeline
      case 4:
        return (
          formData.name &&
          formData.email &&
          formData.phone &&
          (formData.sendToAll || formData.selectedProviders.length > 0)
        )
      default:
        return false
    }
  }

  // Success screen
  if (isComplete) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground mb-4">Quote Request Submitted!</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Your request has been sent to{" "}
            {formData.sendToAll ? "all matching providers" : `${formData.selectedProviders.length} selected providers`}.
            You'll receive quotes via email within the next few hours.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-medium text-foreground mb-4">What happens next?</h3>
            <div className="space-y-4">
              {[
                { step: "1", text: "Providers review your request and prepare personalized quotes" },
                { step: "2", text: "You'll receive quotes via email (usually within 2-4 hours)" },
                { step: "3", text: "Compare offers and choose the best provider for your needs" },
                { step: "4", text: "Book directly with your chosen provider" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium flex items-center justify-center flex-shrink-0">
                    {item.step}
                  </div>
                  <span className="text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/market">
              <Button variant="outline" className="border-white/10 bg-white/5">
                Back to Marketplace
              </Button>
            </Link>
            <Link href={`/market/${formData.serviceCategory}`}>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Browse More Providers</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/market"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
        <h1 className="text-3xl font-medium tracking-tight text-foreground mt-4">Request Quotes</h1>
        <p className="text-muted-foreground mt-2">Tell us what you need and receive quotes from verified providers</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Step {currentStep} of 4</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2">
          {["Service", "Property", "Requirements", "Contact"].map((label, index) => (
            <span
              key={label}
              className={`text-xs ${index + 1 <= currentStep ? "text-primary" : "text-muted-foreground"}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-border bg-card backdrop-blur mb-6 dark:border-white/10">
        <CardContent className="p-6 sm:p-8">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-medium text-foreground mb-2">What service do you need?</h2>
                <p className="text-muted-foreground">Select the type of service you're looking for</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {serviceCategories.map((category) => {
                  const Icon = category.icon
                  const isSelected = formData.serviceCategory === category.id
                  return (
                    <button
                      key={category.id}
                      onClick={() => updateFormData("serviceCategory", category.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <h3 className={`font-medium text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Property Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-medium text-foreground mb-2">Property Details</h2>
                <p className="text-muted-foreground">Tell us about the property</p>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="address">Property Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={formData.propertyAddress}
                    onChange={(e) => updateFormData("propertyAddress", e.target.value)}
                    className="mt-1.5 bg-white/5 border-white/10"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="suburb">Suburb</Label>
                    <Input
                      id="suburb"
                      placeholder="Sydney"
                      value={formData.propertySuburb}
                      onChange={(e) => updateFormData("propertySuburb", e.target.value)}
                      className="mt-1.5 bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select value={formData.propertyState} onValueChange={(v) => updateFormData("propertyState", v)}>
                      <SelectTrigger className="mt-1.5 bg-white/5 border-white/10">
                        <SelectValue placeholder="Select state" />
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
                  <div>
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      placeholder="2000"
                      value={formData.propertyPostcode}
                      onChange={(e) => updateFormData("propertyPostcode", e.target.value)}
                      className="mt-1.5 bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Property Type</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-1.5">
                    {propertyTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => updateFormData("propertyType", type.value)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          formData.propertyType === type.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-white/10 bg-white/5 text-foreground hover:border-white/20"
                        }`}
                      >
                        <span className="text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Transaction Type</Label>
                  <RadioGroup
                    value={formData.transactionType}
                    onValueChange={(v) => updateFormData("transactionType", v)}
                    className="flex gap-4 mt-1.5"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="buying" id="buying" />
                      <Label htmlFor="buying" className="cursor-pointer">
                        Buying
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="selling" id="selling" />
                      <Label htmlFor="selling" className="cursor-pointer">
                        Selling
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="cursor-pointer">
                        Other
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Requirements */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-medium text-foreground mb-2">Your Requirements</h2>
                <p className="text-muted-foreground">Provide details to help providers give you accurate quotes</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Describe your requirements</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your specific needs, any special requirements, or questions you have..."
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    className="mt-1.5 bg-white/5 border-white/10 min-h-[120px]"
                  />
                </div>

                <div>
                  <Label>When do you need this service?</Label>
                  <div className="grid sm:grid-cols-2 gap-3 mt-1.5">
                    {timelineOptions.map((option) => {
                      const Icon = option.icon
                      const isSelected = formData.timeline === option.value
                      return (
                        <button
                          key={option.value}
                          onClick={() => updateFormData("timeline", option.value)}
                          className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={isSelected ? "text-primary" : "text-foreground"}>{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget">Budget (optional)</Label>
                  <Select value={formData.budget} onValueChange={(v) => updateFormData("budget", v)}>
                    <SelectTrigger className="mt-1.5 bg-white/5 border-white/10">
                      <SelectValue placeholder="Select your budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-500">Under $500</SelectItem>
                      <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                      <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                      <SelectItem value="2000-5000">$2,000 - $5,000</SelectItem>
                      <SelectItem value="5000-plus">$5,000+</SelectItem>
                      <SelectItem value="not-sure">Not sure yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Attachments (optional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Upload contracts, photos, or other relevant documents
                  </p>
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-white/20 transition-colors">
                    <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOC, JPG, PNG up to 10MB</p>
                    </label>
                  </div>

                  {formData.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Contact & Provider Selection */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-medium text-foreground mb-2">Your Contact Details</h2>
                <p className="text-muted-foreground">How should providers reach you?</p>
              </div>

              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      className="mt-1.5 bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="0400 000 000"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      className="mt-1.5 bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className="mt-1.5 bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <Label>Preferred Contact Method</Label>
                  <RadioGroup
                    value={formData.preferredContact}
                    onValueChange={(v) => updateFormData("preferredContact", v)}
                    className="flex gap-4 mt-1.5"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="contact-email" />
                      <Label htmlFor="contact-email" className="cursor-pointer">
                        Email
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="phone" id="contact-phone" />
                      <Label htmlFor="contact-phone" className="cursor-pointer">
                        Phone
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="either" id="contact-either" />
                      <Label htmlFor="contact-either" className="cursor-pointer">
                        Either
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Provider Selection */}
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-foreground">Select Providers</h3>
                    <p className="text-sm text-muted-foreground">Choose who receives your quote request</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.sendToAll}
                      onCheckedChange={(checked) => updateFormData("sendToAll", checked)}
                    />
                    <span className="text-sm text-foreground">Send to all matching providers</span>
                  </label>
                </div>

                {!formData.sendToAll && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Recommended providers based on your requirements:</p>
                    {recommendedProviders.map((provider) => {
                      const isSelected = formData.selectedProviders.includes(provider.id)
                      return (
                        <button
                          key={provider.id}
                          onClick={() => toggleProvider(provider.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? "border-primary bg-primary" : "border-white/20"
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                          </div>
                          <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden">
                            <img
                              src={provider.logo || "/placeholder.svg"}
                              alt={provider.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{provider.name}</span>
                              <Badge
                                className={
                                  provider.verified === "elite"
                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                    : provider.verified === "premium"
                                      ? "bg-primary/20 text-primary border-primary/30"
                                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                }
                              >
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                {provider.verified === "elite"
                                  ? "Elite"
                                  : provider.verified === "premium"
                                    ? "Premium"
                                    : "Verified"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                {provider.rating} ({provider.reviews})
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {provider.responseTime}
                              </span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="border-white/10 bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Submitting...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        )}
      </div>

      {/* Trust Badge */}
      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Shield className="w-4 h-4 text-primary" />
        <span>Your information is secure and only shared with verified providers</span>
      </div>
    </main>
  )
}
