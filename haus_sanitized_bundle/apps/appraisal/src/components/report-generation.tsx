"use client";

import { cn } from "@/lib/utils";
import { Button } from "@v1/ui/button";
import {
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Loader2,
  Send,
} from "lucide-react";
import { useState } from "react";

const reportSections = [
  { label: "Executive Summary", status: "complete" },
  { label: "Property Details", status: "complete" },
  { label: "Comparable Sales Analysis", status: "complete" },
  { label: "Market Conditions", status: "complete" },
  { label: "Rental Appraisal", status: "in-progress" },
  { label: "Marketing Recommendations", status: "pending" },
];

export function ReportGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const completedSections = reportSections.filter(
    (s) => s.status === "complete",
  ).length;
  const progress = (completedSections / reportSections.length) * 100;

  return (
    <div
      className="p-5 sm:p-6 rounded-xl border border-border bg-card space-y-5"
      id="report"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Generate Appraisal Report
          </h3>
          <p className="text-xs text-muted-foreground">
            Create a comprehensive PDF report for your client
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            onClick={() => setIsGenerating(true)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Report Progress
          </span>
          <span className="text-xs text-foreground font-mono">
            {completedSections}/{reportSections.length} sections
          </span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500/50 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Report Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {reportSections.map((section) => (
          <div
            key={section.label}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all",
              section.status === "complete"
                ? "bg-emerald-500/5 border-emerald-500/20"
                : section.status === "in-progress"
                  ? "bg-amber-500/5 border-amber-500/20"
                  : "bg-secondary/30 border-border/50",
            )}
          >
            {section.status === "complete" ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : section.status === "in-progress" ? (
              <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <span
              className={cn(
                "text-xs",
                section.status === "complete"
                  ? "text-foreground"
                  : section.status === "in-progress"
                    ? "text-amber-500"
                    : "text-muted-foreground",
              )}
            >
              {section.label}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-2 bg-transparent"
        >
          <Send className="w-3.5 h-3.5" />
          Email to Client
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-2 bg-transparent"
        >
          <FileText className="w-3.5 h-3.5" />
          Export Data
        </Button>
      </div>
    </div>
  );
}
