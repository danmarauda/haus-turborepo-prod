"use client";

import { Clock, Eye, Heart, MessageSquare, Users } from "lucide-react";

const buyerProfiles = [
  { type: "Upgraders", percentage: 45, color: "bg-emerald-500" },
  { type: "Investors", percentage: 30, color: "bg-blue-500" },
  { type: "First Home", percentage: 15, color: "bg-amber-500" },
  { type: "Downsizers", percentage: 10, color: "bg-orange-500" },
];

const engagementMetrics = [
  { icon: Eye, label: "Page Views", value: "2,847", change: "+12%" },
  { icon: Heart, label: "Saves", value: "156", change: "+8%" },
  { icon: MessageSquare, label: "Enquiries", value: "34", change: "+24%" },
  { icon: Clock, label: "Avg. Time", value: "4:32", change: "+15%" },
];

export function BuyerActivity() {
  return (
    <div
      className="p-5 sm:p-6 rounded-xl border border-border bg-card space-y-5"
      id="buyers"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          Buyer Activity
        </h3>
        <span className="text-[10px] text-muted-foreground font-mono">
          Last 30 days
        </span>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {engagementMetrics.map((metric) => (
          <div
            key={metric.label}
            className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-center"
          >
            <metric.icon className="w-4 h-4 text-muted-foreground mx-auto mb-2" />
            <span className="text-lg font-medium text-foreground block">
              {metric.value}
            </span>
            <span className="text-[10px] text-emerald-500">
              {metric.change}
            </span>
          </div>
        ))}
      </div>

      {/* Buyer Profiles */}
      <div className="space-y-3">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Buyer Profiles
        </span>
        {buyerProfiles.map((profile) => (
          <div key={profile.type} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">{profile.type}</span>
              <span className="text-xs text-muted-foreground font-mono">
                {profile.percentage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${profile.color} rounded-full transition-all duration-500`}
                style={{ width: `${profile.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="space-y-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Recent Enquiries
        </span>
        <div className="space-y-2">
          {[
            {
              initials: "SK",
              name: "Sarah K.",
              time: "2h ago",
              type: "Inspection Request",
            },
            {
              initials: "MJ",
              name: "Michael J.",
              time: "5h ago",
              type: "Price Guide",
            },
            {
              initials: "AL",
              name: "Amanda L.",
              time: "1d ago",
              type: "Contract Request",
            },
          ].map((enquiry) => (
            <div
              key={enquiry.initials}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 hover:border-border bg-secondary/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium text-foreground border border-border">
                {enquiry.initials}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-foreground block truncate">
                  {enquiry.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {enquiry.type}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {enquiry.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
