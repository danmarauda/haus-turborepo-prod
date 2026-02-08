import React, { Component, ErrorInfo, ReactNode } from "react";


import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import * as Sentry from "@sentry/react-native";
import { 
  AlertCircle, 
  RefreshCw, 
  WifiOff, 
  FileX, 
  ShieldAlert,
  Home,
  Bug
} from "lucide-react-native";

// Error types for better UX
export type ErrorType = 
  | "chunk-load" 
  | "network" 
  | "auth" 
  | "not-found" 
  | "render" 
  | "unknown";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorType: ErrorType) => void;
  onReset?: () => void;
  resetOnPropsChange?: boolean;
  context?: Record<string, unknown>;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorType: ErrorType;
  errorId: string;
}

// Helper to determine error type
function getErrorType(error: Error): ErrorType {
  const message = error.message.toLowerCase();
  
  // Chunk load errors
  if (
    message.includes("chunk") ||
    message.includes("loading chunk") ||
    message.includes("failed to fetch dynamically imported module") ||
    message.includes("cannot find module") ||
    message.includes("unable to resolve module")
  ) {
    return "chunk-load";
  }
  
  // Network errors
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("timeout") ||
    message.includes("connection") ||
    error.name === "TypeError" && message.includes("network")
  ) {
    return "network";
  }
  
  // Auth errors
  if (
    message.includes("auth") ||
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("401") ||
    message.includes("403") ||
    message.includes("session") ||
    message.includes("token") ||
    message.includes("credential") ||
    message.includes("sign in") ||
    message.includes("login")
  ) {
    return "auth";
  }
  
  // Not found errors
  if (
    message.includes("not found") ||
    message.includes("404") ||
    message.includes("cannot find")
  ) {
    return "not-found";
  }

  // Render errors
  if (
    message.includes("render") ||
    message.includes("mount") ||
    message.includes("component")
  ) {
    return "render";
  }
  
  return "unknown";
}

/**
 * ErrorBoundary - React Native specific error boundary with Sentry integration
 * 
 * Features:
 * - Captures errors with Sentry
 * - Detects error types for better UX
 * - Shows different UI based on error type
 * - Provides retry functionality
 * - Shows debug info in development
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      errorType: "unknown",
      errorId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorType: getErrorType(error),
      errorId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorType = getErrorType(error);
    
    // Store error info for debugging
    this.setState({ errorInfo });
    
    // Log to Sentry
    Sentry.withScope((scope) => {
      scope.setTag("error-boundary", "true");
      scope.setTag("error-type", errorType);
      scope.setTag("error-id", this.state.errorId);
      scope.setTag("platform", Platform.OS);
      
      if (this.props.context) {
        scope.setContext("error-boundary-context", this.props.context);
      }
      
      scope.setExtras({
        componentStack: errorInfo.componentStack,
        errorType,
        errorId: this.state.errorId,
        platform: Platform.OS,
        version: Platform.Version,
      });
      
      Sentry.captureException(error);
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorType);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when props change (if enabled)
    if (this.props.resetOnPropsChange && 
        this.state.hasError && 
        prevProps.children !== this.props.children) {
      this.handleRetry();
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorType: "unknown",
      errorId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReportIssue = () => {
    // Could open a feedback form or email support
    console.log("User reporting issue:", this.state.errorId);
  };

  getErrorConfig() {
    switch (this.state.errorType) {
      case "chunk-load":
        return {
          icon: FileX,
          title: "Update Available",
          message: "The app has been updated. Please restart to get the latest version.",
          color: "#F59E0B",
          bgColor: "#FEF3C7",
        };
      case "network":
        return {
          icon: WifiOff,
          title: "Connection Error",
          message: "We're having trouble connecting. Please check your internet connection and try again.",
          color: "#3B82F6",
          bgColor: "#DBEAFE",
        };
      case "auth":
        return {
          icon: ShieldAlert,
          title: "Session Expired",
          message: "Your session has expired. Please sign in again to continue.",
          color: "#EF4444",
          bgColor: "#FEE2E2",
        };
      case "not-found":
        return {
          icon: FileX,
          title: "Not Found",
          message: "The content you're looking for couldn't be found.",
          color: "#6B7280",
          bgColor: "#F3F4F6",
        };
      case "render":
        return {
          icon: AlertCircle,
          title: "Display Error",
          message: "We encountered an issue displaying this content. Please try again.",
          color: "#F59E0B",
          bgColor: "#FEF3C7",
        };
      default:
        return {
          icon: AlertCircle,
          title: "Something Went Wrong",
          message: "An unexpected error occurred. Our team has been notified.",
          color: "#EF4444",
          bgColor: "#FEE2E2",
        };
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const config = this.getErrorConfig();
      const Icon = config.icon;
      const showDetails = this.props.showDetails ?? __DEV__;

      return (
        <SafeAreaView style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {/* Icon */}
              <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
                <Icon size={48} color={config.color} />
              </View>

              {/* Title */}
              <Text style={styles.title}>{config.title}</Text>
              
              {/* Message */}
              <Text style={styles.message}>{config.message}</Text>

              {/* Error Details (dev mode only) */}
              {showDetails && this.state.error && (
                <View style={styles.debugContainer}>
                  <Text style={[styles.errorDetails, { color: config.color }]}>
                    Error: {this.state.error.message}
                  </Text>
                  {this.state.error.stack && (
                    <Text style={styles.stackTrace}>
                      {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                    </Text>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <Text style={styles.componentStack}>
                      Component: {this.state.errorInfo.componentStack.split('\n')[1]?.trim()}
                    </Text>
                  )}
                </View>
              )}

              {/* Error ID */}
              <View style={styles.errorIdContainer}>
                <Text style={styles.errorIdLabel}>Error ID:</Text>
                <Text style={styles.errorId}>{this.state.errorId}</Text>
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={[styles.retryButton, { backgroundColor: config.color }]} 
                  onPress={this.handleRetry}
                >
                  <RefreshCw size={20} color="#FFFFFF" />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>

                {this.state.errorType === "chunk-load" && (
                  <TouchableOpacity 
                    style={[styles.secondaryButton, { borderColor: config.color }]} 
                    onPress={() => {
                      // Force app reload
                      if (typeof global !== 'undefined' && (global as typeof global & { __DEV__?: boolean }).__DEV__) {
                        // In dev, we can't really reload the same way
                        this.handleRetry();
                      }
                    }}
                  >
                    <Text style={[styles.secondaryButtonText, { color: config.color }]}>
                      Restart App
                    </Text>
                  </TouchableOpacity>
                )}

                {this.state.errorType === "auth" && (
                  <TouchableOpacity 
                    style={[styles.secondaryButton, { borderColor: config.color }]} 
                    onPress={() => {
                      // Navigate to login - this would typically use navigation
                      this.handleRetry();
                    }}
                  >
                    <Home size={18} color={config.color} />
                    <Text style={[styles.secondaryButtonText, { color: config.color, marginLeft: 8 }]}>
                      Go to Login
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Report Issue Button */}
                <TouchableOpacity 
                  style={styles.reportButton} 
                  onPress={this.handleReportIssue}
                >
                  <Bug size={16} color="#9CA3AF" />
                  <Text style={styles.reportButtonText}>Report Issue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
    maxWidth: 300,
  },
  debugContainer: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: "100%",
    maxWidth: 350,
  },
  errorDetails: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  stackTrace: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
  componentStack: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  errorIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  errorIdLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    marginRight: 6,
  },
  errorId: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionsContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 12,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  reportButtonText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginLeft: 6,
  },
});
