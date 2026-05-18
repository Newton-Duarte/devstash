"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlanFeature {
  label: string;
  included: boolean;
}

interface PricingToggleProps {
  freeFeatures: PlanFeature[];
  proFeatures: PlanFeature[];
}

export function PricingToggle({ freeFeatures, proFeatures }: PricingToggleProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const isYearly = billingCycle === "yearly";

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <div className="flex items-center justify-center gap-3 text-xs font-medium text-slate-400">
        <span className={cn(!isYearly && "text-white")}>Monthly</span>
        <button
          type="button"
          aria-label="Toggle yearly pricing"
          aria-pressed={isYearly}
          onClick={() => setBillingCycle(isYearly ? "monthly" : "yearly")}
          className="relative h-6 w-11 rounded-full border border-white/10 bg-slate-800 p-1 outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span
            className={cn(
              "block size-4 rounded-full bg-slate-400 transition-transform",
              isYearly && "translate-x-5 bg-emerald-400"
            )}
          />
        </button>
        <span className={cn(isYearly && "text-white")}>Yearly</span>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-300">
          Save 25%
        </span>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <PricingCard
          title="Free"
          price="$0"
          suffix="/month"
          description="Perfect for getting started"
          features={freeFeatures}
          buttonLabel="Get Started"
          buttonVariant="outline"
        />
        <PricingCard
          title="Pro"
          price={isYearly ? "$72" : "$8"}
          suffix={isYearly ? "/year" : "/month"}
          description={isYearly ? "Best value for serious builders" : "For serious developers"}
          features={proFeatures}
          buttonLabel="Start Free Trial"
          isFeatured
        />
      </div>
    </div>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  suffix: string;
  description: string;
  features: PlanFeature[];
  buttonLabel: string;
  buttonVariant?: "default" | "outline";
  isFeatured?: boolean;
}

function PricingCard({
  title,
  price,
  suffix,
  description,
  features,
  buttonLabel,
  buttonVariant = "default",
  isFeatured = false,
}: PricingCardProps) {
  return (
    <article
      className={cn(
        "relative rounded-2xl border bg-slate-950/55 p-6 shadow-2xl shadow-black/20",
        isFeatured
          ? "border-primary/80 bg-primary/5 ring-1 ring-primary/30"
          : "border-white/10"
      )}
    >
      {isFeatured ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,#3b82f6_0%,#3b82f6_62%,#8b5cf6_100%)] px-3 py-1 text-[10px] font-bold text-white shadow-lg shadow-blue-950/40">
          Most Popular
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-6 flex items-end gap-1">
        <span className="text-5xl font-black tracking-tight text-white">{price}</span>
        <span className="pb-2 text-sm text-slate-400">{suffix}</span>
      </div>
      <p className="mt-3 text-sm text-slate-400">{description}</p>
      <ul className="mt-7 space-y-3 text-sm text-slate-300">
        {features.map((feature) => (
          <li key={feature.label} className="flex gap-3">
            {feature.included ? (
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden="true" />
            ) : (
              <X className="mt-0.5 size-4 shrink-0 text-slate-600" aria-hidden="true" />
            )}
            <span className={cn(!feature.included && "text-slate-600")}>{feature.label}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={cn(
          buttonVariants({ variant: buttonVariant }),
          "mt-8 w-full",
          isFeatured && "bg-[linear-gradient(90deg,#3b82f6_0%,#3b82f6_62%,#8b5cf6_100%)] hover:opacity-90"
        )}
      >
        {buttonLabel}
      </Link>
    </article>
  );
}
