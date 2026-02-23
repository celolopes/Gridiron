import * as React from "react";
import { cn } from "../utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "low" | "medium" | "high";
}

export function GlassCard({ className, intensity = "medium", ...props }: GlassCardProps) {
  const intensityMap = {
    low: "backdrop-blur-sm",
    medium: "backdrop-blur-md",
    high: "backdrop-blur-xl",
  };

  return <div className={cn("glass-panel rounded-apple overflow-hidden transition-all duration-300", intensityMap[intensity], className)} {...props} />;
}
