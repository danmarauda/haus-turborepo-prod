"use client"

import { useState } from "react"
import type { Property } from "@/types/property"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@v1/ui/dialog"
import { Badge } from "@v1/ui/badge"
import { Button } from "@v1/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@v1/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@v1/ui/tabs"
import {
  Heart,
  Share2,
  MapPin,
  Calendar,
  DollarSign,
  Home,
  User,
  Phone,
  Mail,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface PropertyDetailModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
}

export function PropertyDetailModal({ property, isOpen, onClose }: PropertyDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)

  if (!property) return null

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === "for-rent") {
      return `$${price.toLocaleString()}/week`
    }
    return `$${price.toLocaleString()}`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const images = [
    property.imageUrl,
    ...Array(4)
      .fill(0)
      .map((_, i) => `/placeholder.svg?height=400&width=600&query=property interior ${i + 1}`),
  ]

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] sm:max-h-[85vh] p-0 gap-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 sm:p-6 border-b space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <DialogTitle className="text-lg sm:text-2xl font-bold leading-tight line-clamp-2">
                  {property.title}
                </DialogTitle>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{property.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`h-10 w-10 sm:h-9 sm:w-9 ${isFavorited ? "text-red-500" : ""}`}
                >
                  <Heart className={`w-5 h-5 sm:w-4 sm:h-4 ${isFavorited ? "fill-current" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10 sm:h-9 sm:w-9 bg-transparent">
                  <Share2 className="w-5 h-5 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                {formatPrice(property.price, property.listingType)}
              </div>
              <Badge
                variant={property.listingType === "for-rent" ? "secondary" : "default"}
                className="text-xs sm:text-sm"
              >
                {property.listingType === "for-rent" ? "For Rent" : "For Sale"}
              </Badge>
              {property.lastPriceChange && (
                <Badge variant="outline" className="text-green-600 text-xs sm:text-sm">
                  Price Reduced $
                  {(property.lastPriceChange.previousPrice - property.lastPriceChange.currentPrice).toLocaleString()}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="flex-1">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0 overflow-x-auto scrollbar-hide">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 text-sm"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 text-sm"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="location"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 text-sm"
              >
                Location
              </TabsTrigger>
              <TabsTrigger
                value="agent"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 text-sm"
              >
                Agent
              </TabsTrigger>
            </TabsList>

            <div className="p-4 sm:p-6">
              <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-0">
                <div className="space-y-3">
                  <div className="aspect-[4/3] sm:aspect-video relative overflow-hidden rounded-lg bg-muted">
                    <img
                      src={images[currentImageIndex] || "/placeholder.svg"}
                      alt={`Property image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Navigation arrows - larger on mobile */}
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-8 sm:w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
                    >
                      <ChevronLeft className="h-6 w-6 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-8 sm:w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center"
                    >
                      <ChevronRight className="h-6 w-6 sm:h-5 sm:w-5" />
                    </button>
                    {property.virtualTourUrl && (
                      <div className="absolute top-3 right-3">
                        <Button size="sm" className="bg-primary/90 hover:bg-primary h-9 text-xs sm:text-sm">
                          <ExternalLink className="w-4 h-4 mr-1.5" />
                          Virtual Tour
                        </Button>
                      </div>
                    )}
                    {/* Image counter */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-xs">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </div>

                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 ${
                          currentImageIndex === index ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-card rounded-lg border">
                    <div className="text-xl sm:text-2xl font-bold">{property.bedrooms}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Bedrooms</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-card rounded-lg border">
                    <div className="text-xl sm:text-2xl font-bold">{property.bathrooms}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Bathrooms</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-card rounded-lg border">
                    <div className="text-xl sm:text-2xl font-bold">{property.squareFootage}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Sq Meters</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-card rounded-lg border">
                    <div className="text-xl sm:text-2xl font-bold">{property.yearBuilt || "N/A"}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Year Built</div>
                  </div>
                </div>

                {/* Description */}
                <Card>
                  <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{property.description}</p>
                  </CardContent>
                </Card>

                {/* Amenities */}
                <Card>
                  <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Amenities & Features</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {property.amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs sm:text-sm">
                          {amenity.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      ))}
                      {property.features?.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs sm:text-sm">
                          {feature.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 sm:space-y-6 mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Property Details */}
                  <Card>
                    <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                        Property Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 space-y-2.5 sm:space-y-3">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-muted-foreground">Property Type:</span>
                        <span className="font-medium">{property.propertyType}</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-muted-foreground">Condition:</span>
                        <span className="font-medium">{property.condition || "Good"}</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-muted-foreground">Lot Size:</span>
                        <span className="font-medium">{property.lotSize ? `${property.lotSize}m²` : "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-muted-foreground">Occupancy:</span>
                        <span className="font-medium">{property.occupancyStatus || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-muted-foreground">School District:</span>
                        <span className="font-medium">{property.schoolDistrict || "N/A"}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Details */}
                  <Card>
                    <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                        Financial Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 space-y-2.5 sm:space-y-3">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-muted-foreground">HOA Fees:</span>
                        <span className="font-medium">{property.hoaFees ? `$${property.hoaFees}/month` : "None"}</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-muted-foreground">Property Tax:</span>
                        <span className="font-medium">
                          {property.propertyTax ? `$${property.propertyTax}/year` : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-muted-foreground">Walk Score:</span>
                        <span className="font-medium">{property.walkScore || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-muted-foreground">Transit Score:</span>
                        <span className="font-medium">{property.transitScore || "N/A"}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Listing History */}
                  <Card className="sm:col-span-2">
                    <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                        Listing History
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 space-y-2.5 sm:space-y-3">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-muted-foreground">Listed Date:</span>
                        <span className="font-medium">{formatDate(property.listingDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-muted-foreground">Open House:</span>
                        <span className="font-medium">{formatDate(property.openHouseDate)}</span>
                      </div>
                      {property.lastPriceChange && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700 dark:text-green-400 font-medium text-sm sm:text-base">
                              Price Reduced
                            </span>
                            <span className="text-green-700 dark:text-green-400 font-bold text-sm sm:text-base">
                              -$
                              {(
                                property.lastPriceChange.previousPrice - property.lastPriceChange.currentPrice
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-green-600 dark:text-green-500 mt-1">
                            From ${property.lastPriceChange.previousPrice.toLocaleString()} on{" "}
                            {formatDate(property.lastPriceChange.date)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4 sm:space-y-6 mt-0">
                <Card>
                  <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Location & Neighborhood</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <MapPin className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2" />
                        <p className="text-sm sm:text-base">Interactive Map</p>
                        <p className="text-xs sm:text-sm">Map integration would go here</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <div className="text-center p-3 sm:p-4 bg-card rounded-lg border">
                        <div className="text-lg sm:text-2xl font-bold text-primary">{property.walkScore || 85}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Walk Score</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-card rounded-lg border">
                        <div className="text-lg sm:text-2xl font-bold text-primary">{property.transitScore || 72}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Transit Score</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-card rounded-lg border">
                        <div className="text-lg sm:text-2xl font-bold text-primary">A+</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">School Rating</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="agent" className="space-y-4 sm:space-y-6 mt-0">
                {property.agent && (
                  <Card>
                    <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                        Listing Agent
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-2 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg">{property.agent.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{property.agent.agency}</p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button size="sm" className="flex items-center justify-center gap-2 h-10 sm:h-9 text-sm">
                              <Phone className="w-4 h-4" />
                              {property.agent.phone}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center justify-center gap-2 bg-transparent h-10 sm:h-9 text-sm"
                            >
                              <Mail className="w-4 h-4" />
                              Email Agent
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Contact Form</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <input
                          className="w-full mt-1 px-3 py-2.5 sm:py-2 border rounded-md bg-background text-base"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <input
                          className="w-full mt-1 px-3 py-2.5 sm:py-2 border rounded-md bg-background text-base"
                          placeholder="Your email"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <textarea
                        className="w-full mt-1 px-3 py-2.5 sm:py-2 border rounded-md h-24 bg-background text-base resize-none"
                        placeholder="I'm interested in this property..."
                      />
                    </div>
                    <Button className="w-full h-11 sm:h-10 text-base">Send Message</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
