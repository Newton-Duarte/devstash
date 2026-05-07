const AUTH_ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "You do not have access to continue with that account.",
  CallbackRouteError: "Unable to complete that sign-in request.",
  CredentialsSignin: "Invalid email or password.",
  OAuthAccountNotLinked:
    "This email is already linked to a different sign-in method.",
};

const CREDENTIALS_ERROR_CODES: Record<string, string> = {
  email_not_verified: "Verify your email before signing in.",
  rate_limited: "Too many attempts. Please try again in 15 minutes.",
};

export function getAuthErrorMessage(error: string | null, code: string | null = null) {
  if (!error) {
    return null;
  }

  if (error === "CredentialsSignin" && code) {
    return CREDENTIALS_ERROR_CODES[code] ?? AUTH_ERROR_MESSAGES[error];
  }

  return AUTH_ERROR_MESSAGES[error] ?? "Unable to sign in right now.";
}
