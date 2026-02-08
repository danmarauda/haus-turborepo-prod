"use client";

import { PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AgentDisconnectButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function AgentDisconnectButton({
  onClick,
  disabled,
  className,
  children,
}: AgentDisconnectButtonProps) {
  return (
    <Button
      className={cn(
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        className
      )}
      disabled={disabled}
      onClick={onClick}
      size="sm"
      variant="default"
    >
      {children || (
        <>
          <PhoneOff className="mr-2 h-4 w-4" />
          End
        </>
      )}
    </Button>
  );
}
