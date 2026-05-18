"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";

export function HomeHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function updateScrolled() {
      setIsScrolled(window.scrollY > 24);
    }

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-40 w-full border-b backdrop-blur-xl transition-colors duration-300",
        isScrolled ? "border-white/10 bg-[#05060c]/92" : "border-white/5 bg-[#05060c]/55"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav aria-label="Primary navigation" className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
          <Link className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="#features">
            Features
          </Link>
          <Link className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="#pricing">
            Pricing
          </Link>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link className="text-sm text-slate-300 transition hover:text-white" href="/sign-in">
            Sign In
          </Link>
          <Link
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-[linear-gradient(90deg,#3b82f6_0%,#3b82f6_62%,#8b5cf6_100%)] shadow-lg shadow-blue-950/30 hover:opacity-90"
            )}
            href="/register"
          >
            Get Started
          </Link>
        </div>
        <details className="group relative md:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-md border border-white/10 text-slate-200 outline-none transition hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <Menu className="size-4" aria-hidden="true" />
            <span className="sr-only">Open navigation menu</span>
          </summary>
          <div className="absolute right-0 mt-3 w-48 rounded-xl border border-white/10 bg-slate-950 p-2 shadow-2xl shadow-black/40">
            <Link className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white" href="#features">
              Features
            </Link>
            <Link className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white" href="#pricing">
              Pricing
            </Link>
            <Link className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white" href="/sign-in">
              Sign In
            </Link>
            <Link className="mt-1 block rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground" href="/register">
              Get Started
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
