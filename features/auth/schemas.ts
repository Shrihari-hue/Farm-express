import { z } from "zod";
import { emailSchema, nonEmptyString } from "@utils/validation";

/** Shared by both the login and register forms. */
export const credentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type CredentialsForm = z.infer<typeof credentialsSchema>;

export const registerSchema = credentialsSchema
  .extend({
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type RegisterForm = z.infer<typeof registerSchema>;

export const completeProfileSchema = z.object({
  fullName: nonEmptyString("Full name"),
  farmName: nonEmptyString("Farm name"),
});
export type CompleteProfileForm = z.infer<typeof completeProfileSchema>;
