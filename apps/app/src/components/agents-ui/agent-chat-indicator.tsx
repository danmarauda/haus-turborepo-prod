"use client";

import { motion } from "framer-motion";
import { Loader } from "@/components/ai-elements/loader";
import { cn } from "@/lib/utils";

interface AgentChatIndicatorProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AgentChatIndicator({
  size = "md",
  className,
}: AgentChatIndicatorProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-center gap-2 p-2", className)}
      exit={{ opacity: 0, y: 10 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      <div className={cn("text-muted-foreground", sizeClasses[size])}>
        <Loader size={size === "sm" ? 16 : size === "md" ? 20 : 24} />
      </div>
      <span className="text-muted-foreground text-sm">Thinking...</span>
    </motion.div>
  );
}
