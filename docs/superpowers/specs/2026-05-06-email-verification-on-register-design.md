# Email Verification On Register Design

## Context

The app already supports GitHub OAuth plus email/password registration and sign-in. Registration currently creates a user immediately through `src/app/api/auth/register/route.ts`, and credentials sign-in currently checks only the password in `src/auth.ts`.

The Prisma schema already includes `User.emailVerified` and a `VerificationToken` model, so the cleanest extension is to add verification on top of the existing password flow instead of replacing the auth architecture.

## Goals

- Send a verification email after a user registers with email and password.
- Require the user to click the email link before credentials sign-in is allowed.
- Use Resend for delivery of the verification email.
- Preserve the existing GitHub OAuth flow.
- Preserve the existing password registration model instead of switching to passwordless auth.
- Provide a clear resend path when the verification email is missing, invalid, or expired.
- Fail registration cleanly if the verification email cannot be sent.

## Non-Goals

- No change to the GitHub OAuth experience.
- No password reset flow in this feature.
- No broader account settings UI for managing verification preferences.
- No migration away from Auth.js or Prisma.
- No background job or queue system for email delivery.
- No support for partial signed-in access before email verification.

## Chosen Approach

Create the user immediately, keep `emailVerified` unset until the link is used, and block credentials sign-in until verification is complete.

This approach fits the existing codebase because the user creation flow already exists, the schema already supports verification state, and the Auth.js credentials provider can enforce the verification gate with a small, focused check after password validation.

## Alternatives Considered

### 1. Delay user creation until the email link is clicked

This avoids storing unverified users, but it requires a new pending-registration persistence model and a more custom activation flow. That is more infrastructure than this feature needs.

### 2. Allow sign-in before verification and limit app access

This reduces friction, but the user explicitly chose a stricter rule. It would also require broader authorization checks throughout the app instead of one clear sign-in gate.

### 3. Replace password registration with Auth.js-style email links

This would move the product away from the existing email/password model and create unnecessary inconsistency with the current registration UI and credential handling.

## Architecture

The feature will add or update:

- `src/app/api/auth/register/route.ts` to create a verification token and send a verification email after creating the user
- `src/auth.ts` to reject credentials sign-in for users whose email is not verified
- `src/app/sign-in/page.tsx` and related auth UI to show verification-specific status and error messages
- a dedicated email verification route that consumes the token and marks the user as verified
- a resend verification path for users who need another email
- a small mailer/helper layer for generating links and sending Resend emails

The high-level flow should be:

1. The user submits the register form.
2. The register route validates input, creates the user, creates a verification token, and sends the email.
3. The register UI redirects to a confirmation state that tells the user to check their email instead of inviting them to sign in immediately.
4. The user clicks the verification link.
5. The verification route validates the token, marks `emailVerified`, deletes the used token, and redirects to sign-in with a success state.
6. Credentials sign-in remains blocked until `emailVerified` is set.

## Data Strategy

The implementation should use the existing `VerificationToken` table rather than adding a new model.

The token record should be associated with the registering email address through the existing `identifier` field and should have a short expiration window suitable for email verification.

Rules:

- Only one active verification flow is needed per email at a time.
- Creating or resending a verification email should invalidate older verification tokens for that email.
- A successful verification should set `User.emailVerified` once and remove the consumed token.
- Verification should be idempotent from the user's perspective. If the email is already verified, the route should redirect to a friendly success state rather than erroring.

## Mail Delivery Strategy

Resend should be isolated behind a small server-side helper so the route handlers stay focused on validation and auth behavior.

The email helper should:

- read the Resend API key from environment configuration
- generate the verification URL from the current app origin/environment configuration
- send a plain, clear verification email with a direct call to action
- surface delivery failures back to the registration or resend flow

The email content does not need a complex template in this feature. A simple branded text or lightweight HTML message is enough.

## Route Design

### Registration Route

`src/app/api/auth/register/route.ts` should remain the server boundary for email/password signup.

It should:

- validate the registration payload with the existing schema
- reject duplicate emails as it does today
- create the user with a hashed password and `emailVerified` left unset
- create a fresh verification token for that email
- send the verification email through Resend
- return a success payload that drives a post-registration confirmation state

If email sending fails, the route should not leave behind a newly created unusable account. The registration operation should behave atomically from the user's point of view.

### Verification Route

The verification route should accept the token from the email link, validate it against stored token data and expiration, then complete verification.

It should:

- reject missing, invalid, or expired tokens with a user-friendly redirect state
- set `User.emailVerified`
- delete the used token and any superseded verification tokens for that email
- redirect to `/sign-in` with a success message

### Resend Route Or Action

Add a focused resend endpoint or server action for unverified users.

It should:

- accept an email address
- avoid leaking whether unrelated accounts exist more than necessary
- only send a new verification email when the account exists and is still unverified
- replace any prior active verification token for that email
- return a neutral success response suitable for the sign-in screen

## Auth Enforcement

The credentials provider in `src/auth.ts` should keep its current validation order with one additional rule.

Validation order:

1. Parse the credentials.
2. Look up the user.
3. Verify the password hash.
4. Reject the sign-in if `emailVerified` is null.
5. Return the user only when both password and verification checks pass.

This keeps GitHub OAuth untouched while making email verification a hard gate for credentials sign-in.

## UI Behavior

### Register Screen

After successful registration, the UI should redirect to a confirmation state that clearly says the account was created and the user must verify their email before signing in.

The current `registered=1` success copy should be replaced or extended so it does not imply immediate sign-in readiness.

### Sign-In Screen

The sign-in screen should support these states:

- registration succeeded and verification email was sent
- email verified successfully
- verification link invalid or expired
- credentials sign-in blocked because email is not verified
- resend email sent

The page should continue to use concise inline messaging consistent with the current auth shell.

### Verification Feedback

Verification completion should redirect back into the existing auth UI rather than introducing a fully separate standalone experience unless a tiny dedicated page is needed for route handling.

## Error Handling

- Invalid registration input returns the existing validation-style error response.
- Duplicate email registration remains a conflict response.
- Verification email delivery failure should cause the registration flow to fail cleanly rather than silently creating an unusable account.
- Invalid or expired verification tokens should produce a clear message and a resend path.
- Attempting to verify an already verified user should resolve gracefully.
- Credentials sign-in for unverified users should show a specific verification-required message rather than a generic invalid-credentials message.

## Security Notes

- Verification tokens should be generated from a strong random source.
- Tokens should expire.
- Resend and verify flows should invalidate old tokens so stale links stop working.
- The implementation should avoid exposing sensitive token values anywhere except the verification link itself.
- The verification gate should be enforced on the server in Auth.js, not only in the UI.

## Component Responsibilities

### Mail Helper

- create verification URLs
- send verification emails through Resend
- keep provider-specific email code out of route handlers

### Registration Route

- validate input
- create the user
- create the verification token
- send the verification email
- return registration status

### Verification Route

- validate token state
- mark the user verified
- clean up tokens
- redirect with user-facing status

### Credentials Auth Logic

- continue password validation
- block unverified credentials users
- return verification-specific auth errors for the UI layer to translate

### Auth UI

- show post-registration verification instructions
- show verification success or failure messages
- offer resend where appropriate

## Verification

Before the feature is considered complete, verify:

- a feature branch is created before implementation begins
- the registration flow sends a verification email through Resend
- the verification link marks the user as verified
- unverified email/password users cannot sign in
- verified email/password users can sign in
- GitHub OAuth still works
- expired or invalid verification links show a clear retry path
- resend verification works for unverified users
- `pnpm build` passes

## Open Decisions Resolved

- Verification enforcement: block credentials sign-in completely until verified
- Auth architecture: keep the current Auth.js credentials plus GitHub model
- Persistence model: use existing `User.emailVerified` and `VerificationToken`
- Email provider: use Resend
