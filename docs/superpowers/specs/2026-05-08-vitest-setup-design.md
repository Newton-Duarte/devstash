# Vitest Setup Design

## Summary

Add a minimal Vitest setup for unit testing server-side utilities and lightweight server-action logic in this Next.js app, while explicitly excluding component tests and flows that require heavy Prisma, Auth.js, or external-service mocking.

## Problem

The project currently has no unit test runner configured. The workflow documentation still says to implement unit testing later, which no longer matches the intended development process. This leaves reusable server-side logic unverified and makes it easy for regressions in utility code to slip through.

## Goals

- Add Vitest as the project unit test runner.
- Support tests for TypeScript files that use the `@/*` path alias.
- Keep the test environment Node-focused for server-side code.
- Cover pure and mostly-isolated utilities in `src/lib`.
- Allow lightweight tests for small server-action logic in `src/actions` when it does not require heavy mocking.
- Update workflow and developer docs to reflect the new testing expectations.

## Non-Goals

- No component testing setup.
- No browser or DOM testing environment.
- No Playwright or end-to-end testing changes.
- No broad mock-heavy unit coverage for Prisma, Auth.js, email delivery, or rate-limit providers.
- No attempt to fully unit test all of `src/actions/auth.ts` in this pass.

## Chosen Approach

Use a small Vitest configuration that runs in the Node environment and is aimed at non-UI code only.

This means:

- Add `vitest` and any minimal companion package needed for TypeScript path alias support.
- Add project scripts for running tests once and in watch mode.
- Configure Vitest to resolve `@/*` imports.
- Keep tests focused on `src/lib` and selective lightweight logic in `src/actions`.
- Avoid introducing a browser test environment such as `jsdom`.

## Why This Approach

- It matches the project's current needs without expanding into component or integration testing.
- It keeps the toolchain fast and easy to understand.
- It avoids brittle tests that would mostly exercise mocks instead of real logic.
- It creates a clear baseline that can be expanded later if the project adds more isolated server-side modules.

## Test Scope

Testable targets in this phase:

- Pure helpers in `src/lib`.
- Mostly-isolated auth helpers in `src/lib/auth`.
- Small helper logic in `src/actions` that can be exercised without invoking Prisma, Auth.js runtime behavior, or networked services.

Out of scope in this phase:

- React components and rendering behavior.
- Full server action bodies that depend on Prisma, NextAuth/Auth.js, email delivery, rate limiting, or request runtime APIs in a way that needs extensive mocking.
- End-to-end flows such as sign-in, password reset, or verification email delivery.

## File Layout

Use `*.test.ts` files near the code they cover.

Preferred patterns:

- `src/lib/**/*.test.ts`
- `src/actions/**/*.test.ts` only for lightweight logic that fits the scope above

This keeps tests discoverable and makes the intended boundary clear: server utilities first, server actions only when they contain isolated logic worth testing.

## Documentation Updates

Update `context/ai-interaction.md` so the standard workflow reflects the new testing expectations.

The updated workflow should require:

- Add or update Vitest tests for new or changed server actions and utilities when the logic is reasonably unit-testable.
- Run `pnpm test`, `pnpm lint`, and `pnpm build` before considering implementation complete.
- If code is not meaningfully unit-testable without heavy mocking, document that decision briefly instead of forcing low-value tests.

Also update `README.md` with:

- How to run the test suite.
- The repository testing scope.
- A note that component tests are intentionally out of scope for this setup.

## Expected Files To Change

- `package.json`
- `vitest.config.ts`
- `tsconfig.json` only if needed for Vitest support
- One or more initial `*.test.ts` files in `src/lib` or `src/actions`
- `context/ai-interaction.md`
- `README.md`

## Verification

- `pnpm test` passes.
- `pnpm lint` passes.
- `pnpm build` passes.
- At least one initial test demonstrates the setup against real project code within the approved scope.

## Notes

- This design intentionally treats server actions as a narrow testing surface in the first pass.
- If future work extracts more logic out of large action files into plain server utilities, the unit-test surface can grow naturally without revisiting the test runner setup.
- The brainstorming skill suggests committing the spec, but the current repo workflow says not to commit without permission, so the spec should be reviewed first and committed only if explicitly requested.
