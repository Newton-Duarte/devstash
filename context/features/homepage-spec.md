# Homepage

## Overview

Build the public DevStash homepage from the homepage mockups. Replace the current `/` placeholder with a responsive dark marketing page that introduces DevStash, highlights core features, shows AI productivity, presents pricing, and drives users to register.

## References

- @context/screenshots/homepage-full-visible.png
- @context/screenshots/homepage-mobile.png
- @context/project-overview.md
- @context/coding-standards.md
- @src/app/page.tsx

## Requirements

- Implement the homepage at `/` and match the desktop and mobile mockups closely.
- Use server components by default. Only extract client components where interactivity requires it, such as the pricing monthly/yearly toggle.
- Use Tailwind CSS v4 and existing ShadCN-style primitives such as `Button`; do not add a Tailwind config file.
- Keep copy, feature names, pricing, spacing, cards, gradients, and dark theme consistent with the mockups.
- Keep code clean and dry by extracting repeated marketing sections, cards, pricing data, and footer link data into small local components or constants.
- Make the page fully responsive from mobile through desktop, including stacked mobile sections and desktop grids.
- Preserve accessibility with semantic sections, headings, descriptive links, visible focus states, and non-icon-only controls where possible.

## Page Sections

- Header: logo linking to `/`, desktop nav links for Features and Pricing, Sign In link, Get Started button, and a compact mobile menu matching the mockup.
- Hero: headline, gradient-highlighted text, short description, primary Get Started CTA, secondary See Features CTA, and the before/after knowledge visualization.
- Features: section heading and six feature cards for Code Snippets, AI Prompts, Instant Search, Commands, Files & Docs, and Collections.
- AI Productivity: pro badge, headline, short description, benefit checklist, and code-card preview with generated tag pills.
- Pricing: monthly/yearly toggle, Free and Pro cards, "Most Popular" badge on Pro, feature lists, and pricing that updates with the toggle.
- CTA: final conversion section with Get Started button.
- Footer: DevStash brand summary, grouped footer links, and copyright.

## Links And Navigation

- Get Started buttons link to `/register`.
- Sign In links go to `/sign-in`.
- Logo links to `/`.
- Features nav and See Features link scroll to `#features`.
- Pricing nav links scroll to `#pricing`.
- Footer links should point to existing routes or matching page anchors only. Do not add active internal links to pages that do not exist.

## Component Guidance

- Keep `src/app/page.tsx` as the route entry and a server component.
- Prefer local static arrays for features, pricing features, footer groups, and visual-card data instead of duplicating JSX.
- Use a small client component for pricing toggle state if the displayed monthly/yearly Pro price changes in the UI.
- Use existing `cn`, `Button`, and icon patterns already used in the project.
- Avoid database calls, auth requirements, server actions, or API routes for this static public page.

## Acceptance Criteria

- `/` renders the complete homepage instead of the placeholder heading.
- Desktop layout visually follows `homepage-full-visible.png`.
- Mobile layout visually follows `homepage-mobile.png` without horizontal overflow.
- All CTAs and nav links go to the correct route or anchor.
- The pricing toggle works if included as an interactive control.
- `pnpm lint` and `pnpm build` pass.
