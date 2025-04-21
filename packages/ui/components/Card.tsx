import React from "react";

export type CardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
};

export function Card({
  children,
  className = "",
  onClick,
  padding = "md",
}: CardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={`bg-[#262626] border border-[#373737] rounded-lg ${paddingStyles[padding]} ${className} ${
        onClick
          ? "cursor-pointer hover:border-[#facc15]/50 transition-colors"
          : ""
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
