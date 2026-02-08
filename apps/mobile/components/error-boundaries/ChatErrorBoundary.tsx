import React, { Component, ErrorInfo, ReactNode } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
} from "react-native";
import * as Sentry from "@sentry/react-native";
import { MessageSquare, RefreshCw, Mic, ArrowLeft } from "lucide-react-native";

interface Props {
  children: ReactNode;
  onReset?: () => void;
  onSwitchToVoice?: () => void;
  onGoBack?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
}

/**
 * ChatErrorBoundary - Specialized error boundary for Chat screens
 * 
 * Features:
 * - Chat-appropriate UI
 * - Option to switch to voice chat
 * - Sentry logging with chat context
 */
export default class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setTag("error-boundary", "chat");
      scope.setTag("error-id", this.state.errorId);
      scope.setTag("screen", "chat");
      scope.setContext("chat", {
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
      errorId: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleSwitchToVoice = () => {
    this.setState({ hasError: false });
    if (this.props.onSwitchToVoice) {
      this.props.onSwitchToVoice();
    }
  };

  handleGoBack = () => {
    this.setState({ hasError: false });
    if (this.props.onGoBack) {
      this.props.onGoBack();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <MessageSquare size={48} color="#10B981" />
            </View>

            {/* Title */}
            <Text style={styles.title}>Chat Unavailable</Text>
            
            {/* Message */}
            <Text style={styles.message}>
              We're having trouble loading the chat interface. Your conversation history is safe.
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
                <Text style={styles.primaryButtonText}>Reload Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={this.handleSwitchToVoice}
              >
                <Mic size={18} color="#10B981" />
                <Text style={styles.secondaryButtonText}>Try Voice Instead</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.tertiaryButton} 
                onPress={this.handleGoBack}
              >
                <ArrowLeft size={18} color="#6B7280" />
                <Text style={styles.tertiaryButtonText}>Go Back</Text>
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
    backgroundColor: "#D1FAE5",
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
    backgroundColor: "#10B981",
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
    backgroundColor: "#ECFDF5",
    borderWidth: 1.5,
    borderColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: "#10B981",
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
