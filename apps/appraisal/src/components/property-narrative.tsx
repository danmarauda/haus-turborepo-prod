"use client";

import { Button } from "@v1/ui/button";
import {
  AlignLeft,
  Download,
  FileCheck,
  FileText,
  Maximize,
} from "lucide-react";

export function PropertyNarrative() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="narrative">
      {/* Narrative Card */}
      <div className="lg:col-span-2 p-5 sm:p-6 rounded-xl border border-border bg-card">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-muted-foreground" />
          Property Narrative
        </h3>
        <div className="prose prose-invert prose-sm max-w-none text-muted-foreground leading-relaxed space-y-4">
          <p>
            A masterclass in contemporary design, this transformed Victorian
            terrace balances heritage character with cutting-edge architectural
            innovation. Beyond the classic façade lies a reimagined interior
            where light, space, and functionality converge to create a truly
            sophisticated urban sanctuary.
          </p>
          <p>
            The entry level features formal living and dining zones with
            original fireplaces, flowing seamlessly into a bespoke chef&apos;s
            kitchen equipped with Wolf appliances and honed Calacatta marble
            surfaces. Floor-to-ceiling bi-fold steel doors dissolve the boundary
            between indoors and the private, north-facing landscaped courtyard.
          </p>
          <p>
            Upstairs, the accommodation comprises three generous bedrooms,
            including a master retreat with a boutique-style ensuite and private
            balcony. A versatile attic conversion serves as a fourth bedroom or
            executive home office, capturing sweeping district views across
            Surry Hills.
          </p>
        </div>
      </div>

      {/* Floorplan & Legal Card */}
      <div className="p-5 sm:p-6 rounded-xl border border-border bg-card flex flex-col">
        <h3 className="text-sm font-medium text-foreground mb-4">
          Floorplan & Legal
        </h3>

        {/* Floorplan Preview */}
        <div className="flex-1 bg-secondary/50 rounded-lg border border-border relative overflow-hidden group cursor-pointer mb-4 min-h-[140px]">
          <img
            src="/architectural-floorplan-blueprint-modern-terrace.jpg"
            className="w-full h-full object-cover opacity-50 transition-opacity group-hover:opacity-80"
            alt="Floorplan"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background/80 backdrop-blur px-3 py-1.5 rounded text-[10px] text-foreground border border-border flex items-center gap-2 font-medium hover:bg-background/90 transition-colors">
              <Maximize className="w-3 h-3" />
              View Layout
            </span>
          </div>
        </div>

        {/* Document Links */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between h-auto p-2.5 text-muted-foreground hover:text-foreground group"
          >
            <span className="flex items-center gap-2 text-xs">
              <FileText className="w-3.5 h-3.5" />
              Contract of Sale
            </span>
            <Download className="w-3 h-3 opacity-50 group-hover:opacity-100" />
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-between h-auto p-2.5 text-muted-foreground hover:text-foreground group"
          >
            <span className="flex items-center gap-2 text-xs">
              <FileCheck className="w-3.5 h-3.5" />
              Strata Report
            </span>
            <Download className="w-3 h-3 opacity-50 group-hover:opacity-100" />
          </Button>
        </div>
      </div>
    </section>
  );
}
