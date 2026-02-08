"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HausLogo } from "./haus-logo"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, Menu, Home, Search, Compass, Plus, LogOut, Settings, User } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "../utils"

// Mock user data - in production this would come from auth context
const mockUser = {
  firstName: "Sarah",
  lastName: "Mitchell",
  email: "sarah.mitchell@example.com",
  avatar: "/professional-woman-headshot.png",
}

export function Header() {
  const pathname = usePathname()

  return (
    <>
      <header className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 sticky top-0 sm:top-4 z-50">
        <div className="flex items-center justify-between rounded-full border border-border/50 bg-background/80 backdrop-blur-md px-3 sm:px-4 py-2 shadow-lg">
          <Link href="/" className="touch-target flex items-center">
            <HausLogo />
          </Link>

          <nav className="hidden xl:flex items-center gap-4 2xl:gap-6">
            <Link
              href="/explore"
              className={cn(
                "text-sm font-medium tracking-tight transition-colors touch-target flex items-center",
                pathname === "/explore" ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              EXPLORE
            </Link>
            <Link
              href="/search"
              className={cn(
                "text-sm font-medium tracking-tight transition-colors touch-target flex items-center",
                pathname === "/search" ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              SEARCH
            </Link>
            <Link
              href="/list"
              className={cn(
                "text-sm font-medium tracking-tight transition-colors touch-target flex items-center",
                pathname === "/list" ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              LIST
            </Link>
            <Link
              href="/deephaus"
              className={cn(
                "text-sm font-medium tracking-tight transition-colors touch-target flex items-center",
                pathname === "/deephaus" ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              DEEPHAUS
            </Link>
            <Link
              href="/warehaus"
              className={cn(
                "text-sm font-medium tracking-tight transition-colors touch-target flex items-center",
                pathname === "/warehaus" ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              WAREHAUS
            </Link>
            <Link
              href="/agency"
              className={cn(
                "text-sm font-medium tracking-tight transition-colors touch-target flex items-center",
                pathname === "/agency" ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              HAUS.AGENCY
            </Link>
            <Link
              href="/market"
              className={cn(
                "text-sm font-medium tracking-tight transition-colors touch-target flex items-center",
                pathname === "/market" ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              MARKET
            </Link>
            <Link
              href="/trust"
              className={cn(
                "text-sm font-medium tracking-tight transition-colors touch-target flex items-center",
                pathname === "/trust" ? "text-destructive" : "text-muted-foreground hover:text-foreground",
              )}
            >
              DUD
            </Link>
            <Link
              href="/compass"
              className={cn(
                "text-sm font-medium tracking-tight transition-colors touch-target flex items-center",
                pathname === "/compass" ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              COMPASS
            </Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/saved">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full h-11 w-11 touch-target transition-colors",
                  pathname === "/saved"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Heart className={cn("h-5 w-5", pathname === "/saved" && "fill-primary")} />
              </Button>
            </Link>
            <ThemeToggle />

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 touch-target p-0 hover:bg-accent">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.firstName} />
                    <AvatarFallback className="text-xs font-semibold">
                      {mockUser.firstName[0]}
                      {mockUser.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">{mockUser.firstName} {mockUser.lastName}</p>
                  <p className="text-xs text-muted-foreground">{mockUser.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile" className="block">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/documents" className="block">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Documents</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet>
              <SheetTrigger asChild className="xl:hidden">
                <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 touch-target">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
                <nav className="flex flex-col h-full pt-safe">
                  <div className="p-6 border-b border-border">
                    <HausLogo />
                  </div>

                  <div className="flex-1 overflow-y-auto scroll-momentum p-4 space-y-1">
                    {[
                      { href: "/", label: "HOME" },
                      { href: "/explore", label: "EXPLORE" },
                      { href: "/search", label: "SEARCH" },
                      { href: "/list", label: "LIST" },
                      { href: "/deephaus", label: "DEEPHAUS" },
                      { href: "/warehaus", label: "WAREHAUS" },
                      { href: "/agency", label: "HAUS.AGENCY" },
                      { href: "/market", label: "MARKET" },
                      { href: "/trust", label: "DUD" },
                      { href: "/compass", label: "COMPASS" },
                      { href: "/documents", label: "DOCUMENTS" },
                      { href: "/messages", label: "MESSAGES" },
                      { href: "/properties", label: "PROPERTIES" },
                    ].map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium transition-colors touch-target",
                          pathname === href
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted active:bg-muted",
                        )}
                      >
                        {Icon && <Icon className="w-5 h-5" />}
                        {label}
                      </Link>
                    ))}
                  </div>

                  <div className="p-4 border-t border-border pb-safe">
                    <Link href="/list" className="block">
                      <Button className="w-full h-12 text-base font-medium bg-primary text-primary-foreground rounded-xl">
                        <Plus className="w-5 h-5 mr-2" />
                        List a Property (Free)
                      </Button>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/95 backdrop-blur-lg border-t border-border pb-safe">
        <div className="flex items-center justify-around px-2 py-1">
          {[
            { href: "/", icon: Home, label: "Home" },
            { href: "/search", icon: Search, label: "Search" },
            { href: "/list", icon: Plus, label: "List", primary: true },
            { href: "/compass", icon: Compass, label: "Map" },
            { href: "/saved", icon: Heart, label: "Saved" },
          ].map(({ href, icon: Icon, label, primary }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-colors touch-target",
                primary && "relative -mt-4",
                pathname === href && !primary && "text-primary",
                !primary && pathname !== href && "text-muted-foreground",
              )}
            >
              {primary ? (
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
              ) : (
                <>
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] mt-1 font-medium">{label}</span>
                </>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
