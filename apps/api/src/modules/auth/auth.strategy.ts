/**
 * Auth token validation strategy.
 * - Production: JWT verification when AUTH_JWT_SECRET is set.
 * - Local dev: Bearer token = userId (no verification).
 * See docs/security-model.md.
 */

export interface AuthResult {
  userId: string;
  /** JWT sub claim if from JWT. */
  sub?: string;
  /** Role from JWT claims if present (app may override from DB). */
  role?: string;
}

export interface TokenValidator {
  validate(token: string): Promise<AuthResult | null>;
}

/**
 * Dev-only: treat Bearer token as userId. No verification.
 * Use only when AUTH_JWT_SECRET is not set.
 */
export function createDevTokenValidator(): TokenValidator {
  return {
    async validate(token: string): Promise<AuthResult | null> {
      if (!token || token.length > 256) return null;
      // TODO(production): Disable when AUTH_JWT_SECRET set; reject opaque tokens.
      return { userId: token };
    },
  };
}

/**
 * JWT validator using HS256. Requires AUTH_JWT_SECRET.
 * Expects payload: { sub: string } (userId). Optional: { role: string }.
 */
export async function createJwtValidator(secret: string): Promise<TokenValidator> {
  const { jwtVerify } = await import("jose");
  const key = new TextEncoder().encode(secret);

  return {
    async validate(token: string): Promise<AuthResult | null> {
      try {
        const { payload } = await jwtVerify(token, key, {
          algorithms: ["HS256"],
          clockTolerance: 10,
        });
        const sub = payload.sub;
        if (!sub || typeof sub !== "string") return null;
        const role = typeof payload["role"] === "string" ? payload["role"] : undefined;
        return {
          userId: sub,
          sub,
          ...(role !== undefined && { role }),
        };
      } catch {
        return null;
      }
    },
  };
}
