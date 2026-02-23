import * as React from "react";
import { cn } from "../utils";

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "success" | "warning" | "destructive" | "glass" }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground": variant === "default",
          "border-transparent bg-green-500 text-white": variant === "success",
          "border-transparent bg-yellow-500 text-white": variant === "warning",
          "border-transparent bg-red-500 text-white": variant === "destructive",
          "glass-panel text-foreground backdrop-blur-md": variant === "glass",
        },
        className,
      )}
      {...props}
    />
  );
}
