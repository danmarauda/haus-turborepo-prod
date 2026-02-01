"use client";

import { useState } from "react";
import { Button } from "@v1/ui/button";
import { Card, CardContent } from "@v1/ui/card";
import { Input } from "@v1/ui/input";
import { 
  Search, 
  Hammer, 
  Paintbrush, 
  Wrench, 
  Zap, 
  Droplets, 
  TreePine,
  Home,
  Shield,
  Truck
} from "lucide-react";

const services = [
  { id: 1, name: "Plumbing", icon: Droplets, count: 245 },
  { id: 2, name: "Electrical", icon: Zap, count: 189 },
  { id: 3, name: "Painting", icon: Paintbrush, count: 312 },
  { id: 4, name: "Carpentry", icon: Hammer, count: 156 },
  { id: 5, name: "Landscaping", icon: TreePine, count: 98 },
  { id: 6, name: "General Repairs", icon: Wrench, count: 287 },
  { id: 7, name: "Home Security", icon: Shield, count: 67 },
  { id: 8, name: "Moving Services", icon: Truck, count: 124 },
];

export default function MarketPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">HAUS Marketplace</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find trusted tradespeople, home services, and real estate professionals.
          </p>
        </div>

        <div className="flex gap-4 max-w-xl mx-auto mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button>Search</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.id} className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.count} providers</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
