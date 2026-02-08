import { SavedProperties } from "@/components/haus/saved-properties";
import { ScrollAwareNavigation } from "@/components/scroll-aware-navigation";

// Force dynamic rendering to avoid Convex hooks during static generation
export const dynamic = "force-dynamic";

export default function SavedPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="-z-10 fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <ScrollAwareNavigation>
        <SavedProperties />
      </ScrollAwareNavigation>
    </div>
  );
}
