import React, { Component, ErrorInfo, ReactNode } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
} from "react-native";
import * as Sentry from "@sentry/react-native";
import { Search, RefreshCw, FilterX, Home } from "lucide-react-native";

interface Props {
  children: ReactNode;
  onReset?: () => void;
  onClearFilters?: () => void;
  onGoHome?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
}

/**
 * SearchErrorBoundary - Specialized error boundary for the Search screen
 * 
 * Features:
 * - Search-appropriate UI with property search branding
 * - Option to clear filters and retry
 * - Sentry logging with search context
 */
export default class SearchErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setTag("error-boundary", "search");
      scope.setTag("error-id", this.state.errorId);
      scope.setTag("screen", "search");
      scope.setContext("search", {
        timestamp: new Date().toISOString(),
      });
      scope.setExtras({
        componentStack: errorInfo.componentStack,
      });
      Sentry.captureException(error);
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorId: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleClearFilters = () => {
    this.setState({ hasError: false });
    if (this.props.onClearFilters) {
      this.props.onClearFilters();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false });
    if (this.props.onGoHome) {
      this.props.onGoHome();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Search size={48} color="#0EA5E9" />
            </View>

            {/* Title */}
            <Text style={styles.title}>Search Unavailable</Text>
            
            {/* Message */}
            <Text style={styles.message}>
              We're having trouble loading property search results. This could be due to network issues or temporary server problems.
            </Text>

            {/* Error ID */}
            <View style={styles.errorIdContainer}>
              <Text style={styles.errorIdLabel}>Error ID:</Text>
              <Text style={styles.errorId}>{this.state.errorId}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={this.handleRetry}
              >
                <RefreshCw size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={this.handleClearFilters}
              >
                <FilterX size={18} color="#0EA5E9" />
                <Text style={styles.secondaryButtonText}>Clear Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.tertiaryButton} 
                onPress={this.handleGoHome}
              >
                <Home size={18} color="#6B7280" />
                <Text style={styles.tertiaryButtonText}>Go Home</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#E0F2FE",
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
  errorIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  errorIdLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    marginRight: 6,
  },
  errorId: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "monospace",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionsContainer: {
    width: "100%",
    maxWidth: 280,
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F9FF",
    borderWidth: 1.5,
    borderColor: "#0EA5E9",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: "#0EA5E9",
    fontSize: 16,
    fontWeight: "600",
  },
  tertiaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  tertiaryButtonText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "500",
  },
});
