import * as React from "react";
import { cn } from "../utils";

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
}

export function GlassButton({ className, variant = "primary", size = "md", ...props }: GlassButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-apple-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md": variant === "primary",
          "bg-accent text-accent-foreground hover:bg-accent/90 shadow-md": variant === "secondary",
          "hover:bg-glass-bg hover:text-foreground": variant === "ghost",
          "glass-panel hover:bg-glass-bg-hover": variant === "glass",
          "h-8 px-3 text-xs": size === "sm",
          "h-10 px-4 py-2": size === "md",
          "h-12 px-8 text-base": size === "lg",
        },
        className,
      )}
      {...props}
    />
  );
}
