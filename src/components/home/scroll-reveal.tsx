"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: "none" | "sm" | "md" | "lg";
}

const delays = {
  none: "delay-0",
  sm: "delay-100",
  md: "delay-200",
  lg: "delay-300",
};

export function ScrollReveal({ children, className, delay = "none" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        delays[delay],
        isVisible ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
