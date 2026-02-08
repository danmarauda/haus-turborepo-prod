"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@v1/ui/card"
import { Button } from "@v1/ui/button"
import { Badge } from "@v1/ui/badge"
import {
  Star,
  Shield,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  Zap,
  Award,
  ChevronRight,
  Heart,
  MessageSquare,
  BadgeCheck,
} from "lucide-react"
import type { ServiceProvider } from "@/types/marketplace"

interface ProviderCardProps {
  provider: ServiceProvider
  variant?: "default" | "compact" | "featured"
  onFavorite?: (providerId: string) => void
  onQuoteRequest?: (provider: ServiceProvider) => void
  showActions?: boolean
}

export function ProviderCard({
  provider,
  variant = "default",
  onFavorite,
  onQuoteRequest,
  showActions = true,
}: ProviderCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    onFavorite?.(provider.id)
  }

  const handleQuoteRequest = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuoteRequest?.(provider)
  }

  const getVerificationBadge = (level: string) => {
    switch (level) {
      case "elite":
        return {
          label: "Elite",
          className: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30",
          icon: Award,
        }
      case "premium":
        return {
          label: "Premium",
          className: "bg-primary/20 text-primary border-primary/30",
          icon: ShieldCheck,
        }
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

  // Compact variant for smaller displays
  if (variant === "compact") {
    return (
      <Link href={`/market/provider/${provider.slug}`}>
        <Card className="group cursor-pointer overflow-hidden border-border bg-card backdrop-blur transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 h-full">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={provider.logoUrl || "/placeholder.svg"}
                  alt={provider.businessName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                  {provider.businessName}
                </h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{provider.rating}</span>
                  <span>({provider.reviewCount})</span>
                </div>
              </div>
              {showActions && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded-lg"
                  onClick={handleFavorite}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  // Featured variant with enhanced styling
  if (variant === "featured") {
    return (
      <Link href={`/market/provider/${provider.slug}`}>
        <Card className="group cursor-pointer overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card backdrop-blur transition-all hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 h-full relative">
          {provider.featured && (
            <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
              <div className="absolute top-3 right-[-35px] w-[140px] bg-amber-500/90 text-amber-50 text-xs font-medium py-1 text-center rotate-45">
                Featured
              </div>
            </div>
          )}
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={provider.logoUrl || "/placeholder.svg"}
                  alt={provider.businessName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge className={`text-xs ${verificationBadge.className}`}>
                    <VerificationIcon className="w-3 h-3 mr-1" />
                    {verificationBadge.label}
                  </Badge>
                  {provider.availableForUrgent && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Urgent
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  {provider.businessName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {provider.location.city}, {provider.location.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-4 line-clamp-2">{provider.shortDescription}</p>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-medium text-foreground">{provider.rating}</span>
                <span className="text-muted-foreground">({provider.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{provider.completedJobs.toLocaleString()} jobs</span>
              </div>
            </div>

            {/* Service Areas */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {provider.location.suburbs.slice(0, 3).map((suburb) => (
                <Badge key={suburb} variant="outline" className="text-xs border-white/10 bg-white/5">
                  {suburb}
                </Badge>
              ))}
              {provider.location.suburbs.length > 3 && (
                <Badge variant="outline" className="text-xs border-white/10 bg-white/5">
                  +{provider.location.suburbs.length - 3}
                </Badge>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <p className="text-xs text-muted-foreground">Starting from</p>
                <p className="text-lg font-semibold text-foreground">
                  {provider.pricing.startingFrom
                    ? `$${provider.pricing.startingFrom.toLocaleString()}`
                    : "Quote"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {showActions && (
                  <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-xl border-white/10 ${isFavorited ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-white/5"}`}
                    onClick={handleFavorite}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                  </Button>
                )}
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                  onClick={handleQuoteRequest}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Get Quote
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  // Default variant
  return (
    <Link href={`/market/provider/${provider.slug}`}>
      <Card className="group cursor-pointer overflow-hidden border-border bg-card backdrop-blur transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 h-full">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={provider.logoUrl || "/placeholder.svg"}
                alt={provider.businessName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge className={`text-xs ${verificationBadge.className}`}>
                  <VerificationIcon className="w-3 h-3 mr-1" />
                  {verificationBadge.label}
                </Badge>
                {provider.featured && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                    <BadgeCheck className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {provider.businessName}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  {provider.location.city}, {provider.location.state}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{provider.shortDescription}</p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-medium text-foreground">{provider.rating}</span>
              <span className="text-muted-foreground">({provider.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{provider.completedJobs.toLocaleString()} jobs</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {provider.availableForUrgent && (
              <Badge variant="outline" className="text-xs border-white/10 bg-white/5">
                <Zap className="w-3 h-3 mr-1 text-amber-400" />
                Urgent Available
              </Badge>
            )}
            <Badge variant="outline" className="text-xs border-white/10 bg-white/5">
              <Clock className="w-3 h-3 mr-1" />
              {provider.responseTime}
            </Badge>
            {provider.yearsInBusiness >= 10 && (
              <Badge variant="outline" className="text-xs border-white/10 bg-white/5">
                <Award className="w-3 h-3 mr-1 text-primary" />
                {provider.yearsInBusiness}+ years
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div>
              <p className="text-xs text-muted-foreground">Starting from</p>
              <p className="font-semibold text-foreground">
                {provider.pricing.startingFrom
                  ? `$${provider.pricing.startingFrom.toLocaleString()}`
                  : "Quote"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {showActions && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 rounded-lg ${isFavorited ? "text-red-400 hover:text-red-400 hover:bg-red-500/10" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={handleFavorite}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
                    onClick={handleQuoteRequest}
                  >
                    Get Quote
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// Skeleton loader for ProviderCard
export function ProviderCardSkeleton({ variant = "default" }: { variant?: "default" | "compact" | "featured" }) {
  if (variant === "compact") {
    return (
      <Card className="border-border bg-muted backdrop-blur animate-pulse dark:border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted-foreground/20" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-muted-foreground/20 rounded" />
              <div className="h-3 w-20 bg-muted-foreground/20 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-muted backdrop-blur animate-pulse dark:border-white/10">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-muted-foreground/20" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-20 bg-muted-foreground/20 rounded" />
            <div className="h-5 w-40 bg-muted-foreground/20 rounded" />
            <div className="h-3 w-24 bg-muted-foreground/20 rounded" />
          </div>
        </div>
        <div className="h-4 w-full bg-muted-foreground/20 rounded mb-4" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-muted-foreground/20 rounded-full" />
          <div className="h-6 w-20 bg-muted-foreground/20 rounded-full" />
        </div>
        <div className="flex justify-between pt-4 border-t border-white/5">
          <div className="h-4 w-20 bg-muted-foreground/20 rounded" />
          <div className="h-4 w-24 bg-muted-foreground/20 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}
