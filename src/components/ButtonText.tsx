// components/ButtonText.tsx
import React from "react";
import { Link } from "react-router-dom";

interface ButtonTextProps {
  as?: React.ElementType;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  to?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function ButtonText({ 
  as: Component = "button", 
  children, 
  onClick, 
  className = "", 
  ...props 
}: ButtonTextProps) {
  return (
    <Component
      {...props}
      onClick={onClick}
      className={[
        "group inline-flex items-center gap-1",
        "font-semibold text-slate-800 dark:text-slate-100",
        "tracking-wide uppercase text-sm",
        "bg-transparent border-none cursor-pointer",
        "py-2 px-0 transition-transform duration-200",
        "hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60",
        "hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r",
        "hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500",
        "dark:hover:from-indigo-300 dark:hover:via-sky-400 dark:hover:to-emerald-300",
        className,
      ].join(" ")}
    >
      <span className="relative inline-flex items-center gap-1">
        <span>{children}</span>
        <span
          className={[
            "absolute -bottom-1 left-0 h-[2px] w-full",
            "origin-left scale-x-0 bg-slate-800/60 dark:bg-slate-100/60",
            "transition-all duration-200",
            "group-hover:scale-x-100 group-focus-visible:scale-x-100",
            "group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-pink-500",
            "dark:group-hover:from-indigo-300 dark:group-hover:via-sky-400 dark:group-hover:to-emerald-300",
          ].join(" ")}
        />
      </span>
    </Component>
  );
}
