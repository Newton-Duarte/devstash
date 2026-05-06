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
