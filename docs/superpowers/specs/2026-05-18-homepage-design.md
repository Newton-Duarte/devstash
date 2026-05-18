# Homepage Design

## Summary

Build a public DevStash homepage at `/` that replaces the current placeholder with a responsive dark marketing page. The screenshots in `context/screenshots/homepage-full-visible.png` and `context/screenshots/homepage-mobile.png` are inspiration rather than strict pixel targets. The implementation should preserve their content flow, dark developer-focused mood, gradients, card rhythm, pricing shape, and mobile stacking while fitting the existing app design system.

## Goals

- Introduce DevStash as a centralized developer knowledge hub.
- Drive unauthenticated visitors toward registration.
- Highlight snippets, AI prompts, search, commands, files/docs, and collections.
- Present AI productivity benefits and Free/Pro pricing.
- Keep the page static, accessible, responsive, and maintainable.

## Architecture

Keep `src/app/page.tsx` as the route entry and a server component. Use local constants and small local components for repeated marketing data such as features, pricing rows, visual cards, and footer groups. Extract only genuinely interactive UI to a client component, specifically the pricing monthly/yearly toggle if the displayed price changes live.

The page must not use Prisma, auth checks, server actions, API routes, or external services. It should use Tailwind CSS v4 classes, existing ShadCN-style primitives such as `Button`, existing `cn` utility patterns where useful, and icon patterns already present in the app.

## Visual Direction

Use a full dark background with subtle blue and purple gradient accents. Keep the screenshot-inspired vertical flow: compact header, centered hero, before/after visualization, features grid, AI productivity split, pricing, final CTA, and footer.

Adapt the visuals to the current app language rather than hard-coding exact screenshot measurements. Cards should use consistent borders, rounded corners, muted dark fills, and accessible hover/focus treatment. The gradient headline treatment should remain prominent without compromising readability.

## Sections

### Header

The header includes the DevStash logo linking to `/`, desktop anchor links for Features and Pricing, a Sign In link to `/sign-in`, a Get Started button to `/register`, and a compact mobile menu. Mobile navigation should stay simple and match the mockup's compact intent without adding routes that do not exist.

### Hero

The hero includes the main headline, gradient-highlighted developer knowledge phrase, short supporting copy, primary Get Started CTA to `/register`, secondary See Features CTA to `#features`, and a before/after visualization showing scattered knowledge becoming organized in DevStash.

### Features

The features section uses the `#features` anchor, a centered heading, supporting copy, and six cards: Code Snippets, AI Prompts, Instant Search, Commands, Files & Docs, and Collections. Cards should come from a local data array to avoid duplicated JSX.

### AI Productivity

The AI section includes a Pro feature badge, headline, short description, benefit checklist, and a code-card preview with generated tag pills. It is static marketing UI only; no AI call or generated content is needed.

### Pricing

The pricing section uses the `#pricing` anchor, monthly/yearly toggle, Free and Pro cards, a Most Popular badge on Pro, and feature lists. If the Pro price changes when toggled, the toggle lives in a small client component while the rest of the page remains server-rendered.

### CTA

The final CTA repeats the conversion message and links Get Started to `/register`.

### Footer

The footer includes brand summary, grouped footer links, and copyright. Footer links must point only to existing routes or page anchors. Do not add active links to nonexistent pages.

## Responsiveness

Use mobile-first layout. Mobile stacks sections vertically with no horizontal overflow, compact spacing, and full-width cards where appropriate. Desktop uses centered max-width containers, multi-column feature grids, side-by-side AI content, and two-column pricing cards.

## Accessibility

Use semantic `header`, `main`, `section`, and `footer` landmarks. Preserve heading order. Use descriptive link text, visible focus states, sufficient color contrast, and labeled controls for the pricing toggle and mobile menu. Avoid icon-only controls unless they have accessible labels.

## Testing And Verification

This feature is mostly static UI, so no unit tests are required unless a reusable utility is extracted. Verification should include a browser check for desktop and mobile responsiveness, CTA and anchor link checks, `pnpm lint`, and `pnpm build`.
