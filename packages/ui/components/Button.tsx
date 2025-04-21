import React from "react";

export type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
}: ButtonProps) {
  const baseStyles =
    "rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantStyles = {
    primary: "bg-[#facc15] text-black hover:bg-[#eab308] focus:ring-[#facc15]",
    secondary:
      "bg-[#374151] text-white hover:bg-[#4b5563] focus:ring-[#374151]",
    outline:
      "bg-transparent border border-[#facc15] text-[#facc15] hover:bg-[#facc15]/10 focus:ring-[#facc15]",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
    >
      {children}
    </button>
  );
}
