import { z } from "zod";

export const credentialsFields = {
  email: {
    label: "Email",
    type: "email",
    placeholder: "name@example.com",
  },
  password: {
    label: "Password",
    type: "password",
  },
};

export const credentialsSignInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

export const registerSchema = credentialsSignInSchema
  .extend({
    name: z.string().trim().min(1).max(100),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1),
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(72),
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine(({ currentPassword, password }) => currentPassword !== password, {
    message: "Choose a new password different from your current password.",
    path: ["password"],
  });
