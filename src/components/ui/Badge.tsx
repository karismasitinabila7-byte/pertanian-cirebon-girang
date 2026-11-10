import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "gold" | "blue" | "purple";
  className?: string;
}

export function Badge({ children, variant = "green", className = "" }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}
