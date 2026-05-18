import {
  ArrowRight,
  Bot,
  Check,
  Code2,
  FileText,
  Folder,
  Search,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import { HomeHeader } from "@/components/home/home-header";
import { Logo } from "@/components/home/logo";
import { PricingToggle } from "@/components/home/pricing-toggle";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { ScatteredIconsPanel } from "@/components/home/scattered-icons-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

interface Feature {
  title: string;
  description: string;
  icon: Icon;
  accent: string;
}

interface PlanFeature {
  label: string;
  included: boolean;
}

const features: Feature[] = [
  {
    title: "Code Snippets",
    description:
      "Save reusable code with syntax highlighting, language detection, and instant copy. Never rewrite the same function twice.",
    icon: Code2,
    accent: "bg-blue-500/15 text-blue-300 ring-blue-500/25",
  },
  {
    title: "AI Prompts",
    description:
      "Store and organize your best prompts for ChatGPT, Claude, and other AI tools. Build a personal prompt library.",
    icon: Sparkles,
    accent: "bg-amber-500/15 text-amber-300 ring-amber-500/25",
  },
  {
    title: "Instant Search",
    description:
      "Find anything in milliseconds. Search across all your keys by content, tags, titles, or type with Cmd+K.",
    icon: Search,
    accent: "bg-cyan-500/15 text-cyan-300 ring-cyan-500/25",
  },
  {
    title: "Commands",
    description:
      "Keep your most-used terminal commands at your fingertips. No more digging through bash history.",
    icon: TerminalSquare,
    accent: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25",
  },
  {
    title: "Files & Docs",
    description:
      "Upload and manage files, images, and documents. Keep your project assets organized alongside your code.",
    icon: FileText,
    accent: "bg-slate-500/15 text-slate-300 ring-slate-500/25",
  },
  {
    title: "Collections",
    description:
      "Group related items into collections. Organize by project, topic, or workflow for quick access.",
    icon: Folder,
    accent: "bg-violet-500/15 text-violet-300 ring-violet-500/25",
  },
];

const freeFeatures: PlanFeature[] = [
  { label: "50 items", included: true },
  { label: "3 collections", included: true },
  { label: "Snippets, Prompts, Commands, Notes, Links", included: true },
  { label: "Basic search", included: true },
  { label: "File & image uploads", included: false },
  { label: "AI features", included: false },
];

const proFeatures: PlanFeature[] = [
  { label: "Unlimited items", included: true },
  { label: "Unlimited collections", included: true },
  { label: "All item types including Files & Images", included: true },
  { label: "AI auto-tagging & summaries", included: true },
  { label: "AI Explain This Code", included: true },
  { label: "Data export (JSON/ZIP)", included: true },
];

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Get Started", href: "/register" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "AI Productivity", href: "#ai-productivity" },
      { label: "Collections", href: "#features" },
      { label: "Final CTA", href: "#cta" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/sign-in" },
      { label: "Create Account", href: "/register" },
    ],
  },
];

const codeLines = [
  "export function useDebounce<T>(",
  "  value: T,",
  "  delay: number",
  ") {",
  "  const [debounced, setDebounced] =",
  "    useState(value);",
  "",
  "  useEffect(() => {",
  "    const t = setTimeout(() =>",
  "      setDebounced(value), delay);",
  "    return () => clearTimeout(t);",
  "  }, [value, delay]);",
  "",
  "  return debounced;",
  "}",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#05060c] text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.18),transparent_32rem),radial-gradient(circle_at_80%_40%,rgba(139,92,246,0.12),transparent_28rem)]" />
      <HomeHeader />
      <Hero />
      <FeaturesSection />
      <AiSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="px-5 pt-28 pb-24 sm:pt-32 lg:pb-32">
      <div className="mx-auto max-w-5xl text-center">
        <ScrollReveal>
          <Badge variant="secondary" className="mb-6 border-blue-400/20 bg-blue-400/10 text-blue-200">
            Store Smarter. Build Faster.
          </Badge>
          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
            Stop Losing Your <span className="bg-[linear-gradient(90deg,#3b82f6_0%,#3b82f6_62%,#8b5cf6_100%)] bg-clip-text text-transparent">Developer Knowledge</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
            Your snippets, prompts, commands, and notes are scattered across Notion, GitHub, Slack, and a dozen browser tabs. DevStash brings them all into one fast, searchable hub.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link className={cn(buttonVariants(), "bg-[linear-gradient(90deg,#3b82f6_0%,#3b82f6_62%,#8b5cf6_100%)] px-6 shadow-lg shadow-blue-950/35 hover:opacity-90")} href="/register">
              Get Started Free
            </Link>
            <Link className={cn(buttonVariants({ variant: "outline" }), "border-white/10 bg-white/[0.03] px-6 text-slate-200 hover:bg-white/10")} href="#features">
              See Features
            </Link>
          </div>
        </ScrollReveal>
        <ScrollReveal delay="sm">
          <KnowledgeVisual />
        </ScrollReveal>
      </div>
    </section>
  );
}

function KnowledgeVisual() {
  return (
    <div className="mx-auto mt-16 grid max-w-4xl items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
      <VisualPanel title="Your knowledge today..." scattered />
      <div className="flex justify-center" aria-hidden="true">
        <div className="relative flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#3b82f6] shadow-lg shadow-[#3b82f6]/10">
          <span className="absolute inset-0 rounded-full bg-[#3b82f6]/15 animate-ping" />
          <ArrowRight className="relative size-6 rotate-90 animate-pulse md:rotate-0" />
        </div>
      </div>
      <VisualPanel title="...with DevStash" />
    </div>
  );
}

function VisualPanel({ title, scattered = false }: { title: string; scattered?: boolean }) {
  return (
    <div>
      <p className="mb-3 text-left text-[10px] font-bold uppercase tracking-[0.28em] text-slate-600">{title}</p>
      <div className="relative h-52 overflow-hidden rounded-xl border border-white/10 bg-slate-900/65 p-5 shadow-2xl shadow-black/30">
        {scattered ? (
          <ScatteredIconsPanel />
        ) : (
          <div className="grid h-full grid-cols-[2.5rem_1fr] gap-4">
            <div className="rounded-lg bg-slate-950/70 p-2">
              <div className="mb-3 h-1.5 rounded bg-blue-400" />
              <div className="space-y-2">
                <div className="h-5 rounded bg-slate-800" />
                <div className="h-5 rounded bg-slate-800" />
                <div className="h-5 rounded bg-slate-800" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                "border-[#3b82f6]",
                "border-amber-400",
                "border-cyan-400",
                "border-emerald-400",
                "border-fuchsia-400",
                "border-[#8b5cf6]",
              ].map((color) => (
                <div key={color} className={cn("rounded-lg border-t-2 bg-slate-800/80", color)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeading
            title="Everything You Need, One Place"
            description="Stop context-switching between tools. DevStash keeps all your developer resources organized and searchable."
          />
        </ScrollReveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index % 3 === 0 ? "none" : index % 3 === 1 ? "sm" : "md"}>
              <FeatureCard feature={feature} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const IconComponent = feature.icon;

  return (
    <article className="group rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-white/20 hover:bg-slate-900/75">
      <div className={cn("mb-8 flex size-10 items-center justify-center rounded-lg ring-1", feature.accent)}>
        <IconComponent className="size-5" aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-white">{feature.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
    </article>
  );
}

function AiSection() {
  return (
    <section id="ai-productivity" className="px-5 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <ScrollReveal>
          <Badge className="border-amber-300/20 bg-amber-400 text-slate-950">Pro Feature</Badge>
          <h2 className="mt-6 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
            AI-Powered <span className="block bg-[linear-gradient(90deg,#3b82f6_0%,#3b82f6_62%,#8b5cf6_100%)] bg-clip-text text-transparent">Productivity</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
            Let AI handle the busywork so you can focus on building. Turn raw snippets and prompts into organized, searchable knowledge.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-slate-300">
            {[
              "Auto-tag suggestions based on content",
              "AI-generated summaries for long snippets",
              "Explain This Code one-click breakdowns",
              "Prompt optimizer for better AI results",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Check className="size-4 text-emerald-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </ScrollReveal>
        <ScrollReveal delay="sm">
          <CodePreview />
        </ScrollReveal>
      </div>
    </section>
  );
}

function CodePreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0d16] shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex gap-2">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="text-xs text-slate-500">typescript.ts</span>
      </div>
      <pre className="overflow-x-auto p-6 text-xs leading-6 text-slate-300 sm:text-sm">
        <code>
          {codeLines.map((line, index) => (
            <span key={`${line}-${index}`} className="block">
              <span className="mr-4 select-none text-slate-600">{String(index + 1).padStart(2, "0")}</span>
              {line}
            </span>
          ))}
        </code>
      </pre>
      <div className="border-t border-amber-400/10 bg-amber-400/[0.04] p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
          <Bot className="size-4" aria-hidden="true" />
          AI generated tags
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "react",
            "hooks",
            "debounce",
            "typescript",
            "performance",
          ].map((tag) => (
            <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="px-5 py-24 sm:py-32">
      <ScrollReveal>
        <SectionHeading
          title="Simple, Transparent Pricing"
          description="Start free. Upgrade when you need more power."
        />
      </ScrollReveal>
      <ScrollReveal delay="sm">
        <PricingToggle freeFeatures={freeFeatures} proFeatures={proFeatures} />
      </ScrollReveal>
    </section>
  );
}

function CtaSection() {
  return (
    <section id="cta" className="border-y border-white/10 px-5 py-24 sm:py-32">
      <ScrollReveal className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
          Ready to Organize Your <span className="bg-[linear-gradient(90deg,#3b82f6_0%,#3b82f6_62%,#8b5cf6_100%)] bg-clip-text text-transparent">Developer Knowledge?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-slate-400">
          Join developers who stopped losing their best work and started building from a searchable second brain.
        </p>
        <Link className={cn(buttonVariants(), "mt-8 bg-[linear-gradient(90deg,#3b82f6_0%,#3b82f6_62%,#8b5cf6_100%)] px-7 hover:opacity-90")} href="/register">
          Get Started Free
        </Link>
      </ScrollReveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-5 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.5fr_2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
              Your developer knowledge hub. One place for snippets, prompts, commands, and more.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">{group.title}</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-500">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link className="transition hover:text-white" href={link.href}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-slate-600">
          © 2026 DevStash. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  const [first, ...rest] = title.split(", ");

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
        {first}
        {rest.length > 0 ? (
          <span className="block bg-[linear-gradient(90deg,#3b82f6_0%,#3b82f6_62%,#8b5cf6_100%)] bg-clip-text text-transparent">
            {rest.join(", ")}
          </span>
        ) : null}
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">{description}</p>
    </div>
  );
}
