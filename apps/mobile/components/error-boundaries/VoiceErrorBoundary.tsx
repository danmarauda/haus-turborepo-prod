import React, { Component, ErrorInfo, ReactNode } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
} from "react-native";
import * as Sentry from "@sentry/react-native";
import { Mic, RefreshCw, MessageSquare, PhoneOff } from "lucide-react-native";

interface Props {
  children: ReactNode;
  onReset?: () => void;
  onSwitchToText?: () => void;
  onEndCall?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
}

/**
 * VoiceErrorBoundary - Specialized error boundary for the Voice screen
 * 
 * Features:
 * - Voice-appropriate dark theme UI
 * - Options to switch to text chat or end call
 * - Sentry logging with voice context
 */
export default class VoiceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: `voice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `voice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setTag("error-boundary", "voice");
      scope.setTag("error-id", this.state.errorId);
      scope.setTag("screen", "voice");
      scope.setContext("voice", {
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
      errorId: `voice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleSwitchToText = () => {
    this.setState({ hasError: false });
    if (this.props.onSwitchToText) {
      this.props.onSwitchToText();
    }
  };

  handleEndCall = () => {
    this.setState({ hasError: false });
    if (this.props.onEndCall) {
      this.props.onEndCall();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Mic size={48} color="#EF4444" />
            </View>

            {/* Title */}
            <Text style={styles.title}>Voice Connection Lost</Text>
            
            {/* Message */}
            <Text style={styles.message}>
              We encountered an issue with the voice assistant. Your conversation history has been saved.
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
                <RefreshCw size={20} color="#000000" />
                <Text style={styles.primaryButtonText}>Reconnect Voice</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={this.handleSwitchToText}
              >
                <MessageSquare size={18} color="#FFFFFF" />
                <Text style={styles.secondaryButtonText}>Switch to Text</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.tertiaryButton} 
                onPress={this.handleEndCall}
              >
                <PhoneOff size={18} color="#9CA3AF" />
                <Text style={styles.tertiaryButtonText}>End Call</Text>
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
    backgroundColor: "#0a0a0a",
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
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#9CA3AF",
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
    color: "#6B7280",
    marginRight: 6,
  },
  errorId: {
    fontSize: 13,
    color: "#9CA3AF",
    fontFamily: "monospace",
    backgroundColor: "#1a1a1a",
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
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
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
    color: "#9CA3AF",
    fontSize: 15,
    fontWeight: "500",
  },
});
