# Forgot Password Design

## Context

The app already supports email/password authentication, GitHub OAuth, Resend-backed email verification, and token-based email flows backed by the existing `VerificationToken` model.

The current auth experience does not provide a password recovery path for credentials users. This feature adds a forgot-password flow while reusing the existing token infrastructure instead of introducing a new token table or a separate auth subsystem.

## Goals

- Add a forgot-password entry point from the sign-in flow.
- Allow users to request a password reset email.
- Allow users to set a new password using a reset token.
- Reuse the existing `VerificationToken` model for password reset tokens.
- Keep the flow visually and structurally consistent with the current auth UI and email patterns.
- Avoid leaking whether an email belongs to a valid credentials account through the request-reset success state.

## Non-Goals

- No new Prisma model for password reset tokens.
- No account settings UI for changing passwords while signed in.
- No changes to GitHub OAuth behavior.
- No broader rewrite of the existing email-verification flow.
- No rate-limiting or abuse-prevention system beyond current scope.

## Chosen Approach

Reuse `VerificationToken`, but isolate password reset records with namespaced identifiers such as `password-reset:<email>`.

This approach keeps the persistence model minimal while preventing collisions with the existing email-verification tokens that currently use plain email identifiers. It also fits the current app architecture, which already has token creation, token hashing, token expiration, and Resend-based email delivery patterns in place.

## Alternatives Considered

### 1. Reuse `VerificationToken` with plain email identifiers

This looks simpler initially, but it mixes password reset and email verification records in the same identifier namespace. That increases the risk of deleting or validating the wrong token set.

### 2. Create a dedicated password reset token model

This gives clean conceptual separation, but it conflicts with the explicit requirement to reuse the existing `VerificationToken` model and adds unnecessary schema overhead.

## Architecture

Add a focused password-reset helper layer alongside the existing email-verification helper.

The implementation should add or update:

- `src/components/auth/sign-in-form.tsx` to include a forgot-password link
- a forgot-password page that collects the user's email
- a reset-password page that accepts a token and collects the new password
- a request-reset server action
- a submit-reset server action
- a helper module that creates, validates, and cleans up password reset tokens using `VerificationToken`
- a mail helper for password reset email delivery, which may share lower-level email utilities with existing verification mail code if that reuse remains clean

GitHub OAuth, normal credentials sign-in, and the existing email-verification flow should remain unchanged.

## Token Strategy

Password reset tokens should reuse the same general model as verification tokens:

- strong random raw token
- hashed token stored in the database
- expiration timestamp
- one active reset flow per email at a time

To isolate reset records from verification records, the `identifier` field should use a namespaced value such as `password-reset:<email>`.

Rules:

- requesting a new reset email should invalidate older reset tokens for that email
- invalid or expired reset tokens should not affect email-verification tokens
- successful password reset should delete all reset tokens for that email namespace

## Request Reset Flow

The forgot-password page should collect an email address and submit through a server action.

The request-reset action should:

1. validate the email
2. look up the user
3. return a neutral success message when the email does not exist
4. return the same neutral success message when the user exists but has no `passwordHash`, such as a GitHub-only account
5. create a reset token and send the reset email only when the user is a credentials account
6. return a generic error message when mail delivery fails for an eligible account

The neutral success copy should communicate that if the email is valid, the user will receive a reset email.

## Reset Completion Flow

The reset-password page should accept a token from the email link and present a form for a new password and password confirmation.

The submit-reset action should:

1. validate the token and the password fields
2. reject invalid or expired tokens with a clear error state
3. look up the credentials user tied to the token namespace
4. hash the new password
5. update the user's `passwordHash`
6. delete all password reset tokens for that email namespace
7. redirect to sign-in with a password-reset success state

Successful reset should not sign the user in automatically.

## UI Behavior

### Sign-In Page

Add a `Forgot password?` link near the password field, consistent with the current auth layout.

### Forgot Password Page

Use the existing auth shell styling and patterns.

The page should:

- show a simple email field
- show inline success and error messaging
- keep copy concise and neutral

### Reset Password Page

Use the existing auth shell styling and patterns.

The page should:

- accept the token from the URL
- collect new password and confirmation
- show inline invalid or expired token states
- show a clear success path back to sign-in after reset completes

## Email Delivery Strategy

Password reset emails should continue using the current Resend-based delivery approach.

The reset email should:

- include a direct link to the reset-password page with the raw token
- use concise plain-text and lightweight HTML copy similar to the existing verification email
- preserve existing server-side logging of provider delivery failures

If email delivery fails for an otherwise eligible credentials account, the UI should show a generic error rather than the neutral success message.

## Error Handling

- Unknown email returns neutral success.
- GitHub-only account returns neutral success.
- Invalid input returns normal validation-style errors.
- Mail delivery failure for an eligible credentials account returns a generic send-failure error.
- Invalid token returns a clear reset-link-invalid error state.
- Expired token returns a clear reset-link-expired error state with a path back to request a new email.
- Successful reset redirects to sign-in with a success state.

## Security Notes

- Request-reset should not disclose whether a credentials account exists in the normal success case.
- Tokens must be random, hashed at rest, and time-limited.
- Reset tokens and verification tokens must remain logically separate even though they share the same table.
- Completing a password reset should invalidate older reset links for that account.
- The new password must be hashed using the same password storage approach already used by registration.

## Component Responsibilities

### Password Reset Helper

- build namespaced identifiers for reset tokens
- create reset tokens
- validate reset tokens
- remove older or consumed reset tokens

### Request Reset Action

- validate email input
- return neutral success when appropriate
- create reset token for eligible credentials users
- send reset email
- surface generic delivery failures

### Reset Password Action

- validate token and password input
- load user from reset token
- update password hash
- clean up reset tokens
- return or redirect with user-facing outcome

### Auth UI

- link into forgot-password flow
- show request-reset success and error states
- show reset-password token and submission states

## Verification

Before the feature is considered complete, verify:

- the sign-in page shows a forgot-password link
- credentials users can request a reset email
- unknown emails receive the neutral success message
- GitHub-only accounts receive the neutral success message
- mail-delivery failures show the generic error message
- valid reset links allow password replacement
- invalid and expired reset links show clear error states
- used or superseded reset links no longer work
- `pnpm build` passes

## Open Decisions Resolved

- Persistence model: reuse `VerificationToken`
- Token separation: namespaced identifiers such as `password-reset:<email>`
- Account-enumeration posture: neutral success for unknown and GitHub-only emails
- Delivery-failure behavior: show a generic error when reset email sending fails for an eligible account
- Post-reset behavior: redirect to sign-in instead of automatic sign-in
