"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

interface PriceRangeSliderProps {
  data: number[]
  value: [number, number]
  onValueChange: (value: [number, number]) => void
  listingType?: "for-sale" | "for-rent" | "sold" | "off-market"
  className?: string
}

export function PriceRangeSlider({ data, value, onValueChange, listingType, className }: PriceRangeSliderProps) {
  const isRent = listingType === "for-rent"
  const MIN_PRICE = isRent ? 100 : 50000
  const MAX_PRICE = isRent ? 20000 : 15000000
  const STEP = isRent ? 100 : 50000

  const [localValue, setLocalValue] = useState(value)
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const getPositionFromValue = (val: number) => {
    return ((val - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100
  }

  const getValueFromPosition = (position: number) => {
    const rawValue = (position / 100) * (MAX_PRICE - MIN_PRICE) + MIN_PRICE
    return Math.round(rawValue / STEP) * STEP
  }

  const handleMouseDown = (type: "min" | "max") => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(type)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      const position = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
      const newValue = getValueFromPosition(position)

      setLocalValue((prev) => {
        if (isDragging === "min") {
          const clamped = Math.min(newValue, prev[1] - STEP)
          return [Math.max(MIN_PRICE, clamped), prev[1]]
        } else {
          const clamped = Math.max(newValue, prev[0] + STEP)
          return [prev[0], Math.min(MAX_PRICE, clamped)]
        }
      })
    },
    [isDragging, MIN_PRICE, MAX_PRICE, STEP],
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onValueChange(localValue)
      setIsDragging(null)
    }
  }, [isDragging, localValue, onValueChange])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const formatPrice = (price: number) => {
    if (isRent) {
      return `$${price.toLocaleString()}/mo`
    }
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`
    }
    return `$${(price / 1000).toFixed(0)}K`
  }

  const minPos = getPositionFromValue(localValue[0])
  const maxPos = getPositionFromValue(localValue[1])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Histogram */}
      <div className="h-16 flex items-end gap-px">
        {data.map((height, index) => {
          const barPos = (index / data.length) * 100
          const isInRange = barPos >= minPos && barPos <= maxPos
          return (
            <div
              key={index}
              className={cn(
                "flex-1 rounded-t transition-colors duration-150",
                isInRange ? "bg-primary/60" : "bg-muted/40",
              )}
              style={{ height: `${height * 100}%` }}
            />
          )
        })}
      </div>

      {/* Slider Track */}
      <div ref={sliderRef} className="relative h-2 bg-muted rounded-full cursor-pointer">
        {/* Active Range */}
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{
            left: `${minPos}%`,
            width: `${maxPos - minPos}%`,
          }}
        />

        {/* Min Handle */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-background border-2 border-primary cursor-grab shadow-lg transition-transform",
            isDragging === "min" && "scale-125 cursor-grabbing",
          )}
          style={{ left: `${minPos}%` }}
          onMouseDown={handleMouseDown("min")}
        />

        {/* Max Handle */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-background border-2 border-primary cursor-grab shadow-lg transition-transform",
            isDragging === "max" && "scale-125 cursor-grabbing",
          )}
          style={{ left: `${maxPos}%` }}
          onMouseDown={handleMouseDown("max")}
        />
      </div>

      {/* Price Labels */}
      <div className="flex justify-between text-sm">
        <span className="text-foreground font-medium">{formatPrice(localValue[0])}</span>
        <span className="text-muted-foreground">to</span>
        <span className="text-foreground font-medium">{formatPrice(localValue[1])}</span>
      </div>
    </div>
  )
}
