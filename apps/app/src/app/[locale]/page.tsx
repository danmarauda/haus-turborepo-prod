"use client";

import Link from "next/link";
import { Button } from "@haus/ui/button";
import { Card, CardContent } from "@haus/ui/card";
import { Search, Building2, Warehouse, TrendingUp, Home } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HAUS Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered real estate search with voice commands, commercial listings, and marketplace services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/search">
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Property Search</h3>
                <p className="text-muted-foreground">
                  Voice-powered AI search with natural language queries and smart filters.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/warehaus">
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <Warehouse className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">WAREHAUS</h3>
                <p className="text-muted-foreground">
                  Commercial and industrial property listings for businesses.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/market">
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Marketplace</h3>
                <p className="text-muted-foreground">
                  Home services, tradespeople, and real estate professionals.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="text-center">
          <Link href="/search">
            <Button size="lg" className="mr-4">
              <Search className="h-4 w-4 mr-2" />
              Start Searching
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
