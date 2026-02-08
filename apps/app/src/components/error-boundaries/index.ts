// Error Boundaries - Web App
// Re-export all error boundary components

export { ErrorBoundary, ErrorBoundaryBase } from "../error-boundary";
export type { ErrorType } from "../error-boundary";

export { SearchErrorBoundary } from "./search-error-boundary";
export { VoiceErrorBoundary } from "./voice-error-boundary";
export { MemoryErrorBoundary } from "./memory-error-boundary";
export { AuthErrorBoundary, AuthErrorBoundaryWithRouter } from "./auth-error-boundary";

// Default export for convenience
export { default } from "../error-boundary";
