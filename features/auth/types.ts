export type AuthMethod = "email" | "phone";

/** Carried from the login screen to the OTP screen via router params —
 * kept minimal (just enough to call verifyOtp / resend). */
export interface PendingVerification {
  method: AuthMethod;
  identifier: string; // raw email, or 10-digit phone (without country code)
}
