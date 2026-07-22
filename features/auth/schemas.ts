import { z } from "zod";
import { emailSchema, otpSchema, phoneSchema, nonEmptyString } from "@utils/validation";

export const emailLoginSchema = z.object({
  email: emailSchema,
});
export type EmailLoginForm = z.infer<typeof emailLoginSchema>;

export const phoneLoginSchema = z.object({
  phone: phoneSchema,
});
export type PhoneLoginForm = z.infer<typeof phoneLoginSchema>;

export const otpVerificationSchema = z.object({
  otp: otpSchema,
});
export type OtpVerificationForm = z.infer<typeof otpVerificationSchema>;

export const completeProfileSchema = z.object({
  fullName: nonEmptyString("Full name"),
  farmName: nonEmptyString("Farm name"),
});
export type CompleteProfileForm = z.infer<typeof completeProfileSchema>;
