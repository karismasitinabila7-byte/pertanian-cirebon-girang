import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  elevated?: boolean;
}

export function Card({
  children,
  className = "",
  glass = false,
  elevated = false,
  style,
  ...rest
}: CardProps) {
  const classes = [
    "card",
    glass ? "card-glass" : "",
    elevated ? "card-elevated" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={style} {...rest}>
      {children}
    </div>
  );
}

