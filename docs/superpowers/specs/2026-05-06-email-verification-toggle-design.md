# Email Verification Toggle Design

## Context

The app already supports email/password registration, GitHub OAuth, and a Resend-backed email verification flow for credentials users. Right now, registration always creates an unverified user, sends a verification email, and blocks credentials sign-in until the user clicks the verification link.

That behavior is currently too strict for environments where Resend is not fully configured with a sending domain. In those environments, the product needs a simple way to disable verification entirely so email/password registration can still be used.

## Goals

- Add a simple application-level flag to enable or disable email verification.
- Preserve the current verification flow when the flag is enabled.
- Allow email/password registration and sign-in without verification when the flag is disabled.
- Skip verification messaging entirely when the flag is disabled.
- Keep the toggle easy to configure per environment.

## Non-Goals

- No database-backed settings system.
- No admin UI for changing auth behavior.
- No changes to GitHub OAuth.
- No redesign of the verification token model or verify-email route.
- No broader auth refactor.

## Chosen Approach

Use a server-side environment-backed config flag to control whether email verification is enforced.

The app will read a single environment variable, expose it through a small helper, and reuse that helper anywhere verification behavior is currently enforced. This keeps the change focused, explicit, and easy to toggle across local, preview, and deployed environments.

## Alternatives Considered

### 1. Database-backed runtime setting

This would allow changing the behavior without redeploying, but it introduces settings persistence, defaulting rules, and future admin-management questions that are out of scope for this feature.

### 2. Hybrid env plus database override

This keeps future flexibility open, but it adds complexity without a current need. The simpler env-only model is enough for the product need described here.

## Architecture

Add a small auth configuration helper in `src/lib/auth` that exposes whether email verification is enabled.

That helper should be used in these places:

- `src/app/api/auth/register/route.ts`
- `src/auth.ts`
- `src/actions/auth.ts`
- any auth UI state that currently assumes verification is always active

The existing verification route and Resend email helper should remain in place for the enabled case.

## Configuration Strategy

Use one environment variable, for example `EMAIL_VERIFICATION_ENABLED`, as the source of truth.

Behavior rules:

- Missing value should fall back to a safe default.
- The default should preserve the current production-oriented behavior by keeping verification enabled unless explicitly disabled.
- The parsing logic should be centralized so route handlers and auth logic do not each implement their own string checks.

## Registration Flow

### When verification is enabled

Keep the current registration behavior:

1. Validate the request.
2. Reject duplicate emails.
3. Create the user with `emailVerified` unset.
4. Create a verification token.
5. Send the verification email.
6. Redirect into the sign-in flow with verification-specific messaging.

### When verification is disabled

Use a simpler registration path:

1. Validate the request.
2. Reject duplicate emails.
3. Create the user with `emailVerified` set immediately.
4. Do not create a verification token.
5. Do not send a verification email.
6. Redirect into the sign-in flow with a normal registration success state rather than verification instructions.

This makes disabled mode behave like a normal credentials registration flow without any dependency on Resend.

## Sign-In Enforcement

The credentials provider currently blocks sign-in when `emailVerified` is not set. That enforcement should become conditional.

### When verification is enabled

Keep the current rule:

- valid password plus unverified email means sign-in is rejected

### When verification is disabled

Skip the verification gate entirely.

This preserves password validation while removing unnecessary friction in environments where email verification is intentionally turned off.

## Resend And Verification UI

When verification is enabled, keep the existing states and resend flow.

When verification is disabled:

- do not show post-registration verification messaging
- do not show resend verification UI
- do not surface verification-required sign-in states

The sign-in and register screens should behave like standard credentials auth screens in this mode.

## Error Handling

- If verification is disabled, missing or invalid Resend configuration should not block registration because the email path is not used.
- If verification is enabled, preserve the existing failure behavior when email delivery fails.
- Duplicate email and invalid input handling should remain unchanged.
- Existing verification-route behavior can remain as-is for enabled environments and old links.

## Security Notes

- Verification enforcement must remain server-side when enabled.
- Disabled mode intentionally trades verification strictness for development and operational flexibility.
- The flag should be read only on the server so client code cannot toggle auth enforcement.
- The default behavior should remain verification-on to avoid accidentally weakening environments that expect verification.

## Verification

Before this feature is considered complete, verify:

- verification-enabled mode preserves the current register, verify, resend, and sign-in behavior
- verification-disabled mode creates credentials users in a verified state immediately
- verification-disabled mode does not try to send mail or create verification tokens
- credentials sign-in is blocked for unverified users only when the flag is enabled
- the auth UI shows the correct success and verification states in both modes
- `pnpm build` passes

## Open Decisions Resolved

- Toggle mechanism: environment variable
- Disabled-mode behavior: treat new email/password users as verified immediately
- Default behavior: verification remains enabled unless explicitly disabled
