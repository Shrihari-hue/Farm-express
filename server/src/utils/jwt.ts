import jwt from "jsonwebtoken";

export interface AccessTokenPayload {
  sub: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
}

/** Issues a 7-day access token containing `{ sub: userId }`. */
export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId } satisfies AccessTokenPayload, getSecret(), {
    expiresIn: "7d",
  });
}

/** Verifies and decodes an access token. Throws if invalid/expired. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, getSecret());
  if (typeof decoded === "string" || !decoded.sub) {
    throw new Error("Invalid token payload");
  }
  return { sub: String(decoded.sub) };
}
