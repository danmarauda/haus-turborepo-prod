import React, { Component, ErrorInfo, ReactNode } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
} from "react-native";
import * as Sentry from "@sentry/react-native";
import { Home, RefreshCw, ArrowLeft, Search } from "lucide-react-native";

interface Props {
  children: ReactNode;
  propertyId?: string;
  onReset?: () => void;
  onGoBack?: () => void;
  onSearch?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
}

/**
 * PropertyErrorBoundary - Specialized error boundary for Property Detail screen
 * 
 * Features:
 * - Property-appropriate UI
 * - Option to go back or search for other properties
 * - Sentry logging with property context
 */
export default class PropertyErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: `property-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `property-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setTag("error-boundary", "property");
      scope.setTag("error-id", this.state.errorId);
      scope.setTag("screen", "property-detail");
      scope.setContext("property", {
        propertyId: this.props.propertyId,
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
      errorId: `property-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoBack = () => {
    this.setState({ hasError: false });
    if (this.props.onGoBack) {
      this.props.onGoBack();
    }
  };

  handleSearch = () => {
    this.setState({ hasError: false });
    if (this.props.onSearch) {
      this.props.onSearch();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Home size={48} color="#F59E0B" />
            </View>

            {/* Title */}
            <Text style={styles.title}>Property Unavailable</Text>
            
            {/* Message */}
            <Text style={styles.message}>
              We couldn't load this property's details. It may have been removed, or there might be a connection issue.
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
                onPress={this.handleGoBack}
              >
                <ArrowLeft size={18} color="#F59E0B" />
                <Text style={styles.secondaryButtonText}>Go Back</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.tertiaryButton} 
                onPress={this.handleSearch}
              >
                <Search size={18} color="#6B7280" />
                <Text style={styles.tertiaryButtonText}>Browse Properties</Text>
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
    backgroundColor: "#FEF3C7",
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
    backgroundColor: "#F59E0B",
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
    backgroundColor: "#FFFBEB",
    borderWidth: 1.5,
    borderColor: "#F59E0B",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: "#F59E0B",
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
