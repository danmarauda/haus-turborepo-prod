import { SignJWT, jwtVerify } from 'jose';

// JWT Configuration for React Native authentication
// In production, these should be environment variables
const JWT_SECRET = new TextEncoder().encode(
  process.env.EXPO_PUBLIC_JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Creates a signed JWT token for authenticated users
 * @param payload - User data to encode in the token
 * @param expiresIn - Token expiration time (default: 7 days)
 * @returns Signed JWT token
 */
export async function createToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
  expiresIn: string = '7d'
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  return await new SignJWT({ ...payload, iat: now })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + parseExpiration(expiresIn))
    .sign(JWT_SECRET);
}

/**
 * Verifies and decodes a JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extracts Bearer token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Parses expiration time string to seconds
 */
function parseExpiration(expiresIn: string): number {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1));

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 604800; // 7 days default
  }
}

/**
 * Checks if a token is expired without verifying signature
 * Useful for quick client-side checks
 */
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    return payload.exp ? payload.exp < now : false;
  } catch {
    return true;
  }
}
