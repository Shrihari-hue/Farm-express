import { z } from "zod";

/** Shared Zod primitives used across every form in the app (Step 3+ features
 * import these instead of redefining regexes ad-hoc). */

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

export const nonEmptyString = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

export const positiveNumber = (label: string) =>
  z.coerce.number({ invalid_type_error: `${label} must be a number` }).positive(`${label} must be greater than 0`);

export const nonNegativeNumber = (label: string) =>
  z.coerce.number({ invalid_type_error: `${label} must be a number` }).min(0, `${label} cannot be negative`);

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");
