import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@v1/backend/convex/_generated/api";

export interface AuthSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  isAuthenticated: boolean;
}

/**
 * Get the current auth session for API routes
 * Uses Convex Auth Next.js integration
 */
export async function auth(): Promise<AuthSession | null> {
  try {
    const isAuth = await isAuthenticatedNextjs();
    
    if (!isAuth) {
      return null;
    }

    const token = await convexAuthNextjsToken();
    
    if (!token) {
      return null;
    }

    // Fetch the current user from Convex
    const user = await fetchQuery(
      api.users.getUser,
      {},
      { token }
    );

    if (!user) {
      return null;
    }

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
      },
      isAuthenticated: true,
    };
  } catch (error) {
    console.error("[Auth] Error getting session:", error);
    return null;
  }
}

/**
 * Helper to get the Convex token for server-side calls
 */
export async function getConvexToken(): Promise<string | null> {
  try {
    return await convexAuthNextjsToken();
  } catch {
    return null;
  }
}

/**
 * Check if the current request is authenticated
 */
export async function isAuth(): Promise<boolean> {
  return await isAuthenticatedNextjs();
}
