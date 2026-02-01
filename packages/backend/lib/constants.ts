/**
 * HAUS Constants
 *
 * Central location for app-wide constants to avoid magic strings
 * and ensure consistency across platforms.
 */

/**
 * Anonymous user identifier for unauthenticated sessions
 *
 * Used when a user interacts with the app without authentication.
 * Anonymous users get transient memory that persists only for the session.
 */
export const ANONYMOUS_USER = "anonymous";

/**
 * Memory-related constants
 */
export const MEMORY_CONSTANTS = {
  DEFAULT_IMPORTANCE: 50,
  RECALL_LIMIT: 20,
  POSITIVE_PREFERENCE_THRESHOLD: 30,
} as const;

/**
 * Voice agent identifiers
 */
export const VOICE_AGENTS = {
  HAUS_VOICE_AGENT: "haus-voice-agent",
} as const;
