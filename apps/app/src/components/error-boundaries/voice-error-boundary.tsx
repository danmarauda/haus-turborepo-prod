"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@v1/ui/button";
import { Mic, RefreshCw, MessageSquare, PhoneOff } from "lucide-react";

interface Props {
  children: ReactNode;
  onReset?: () => void;
  onSwitchToText?: () => void;
  onEndCall?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

/**
 * VoiceErrorBoundary - Handles errors specifically in the voice interface
 * 
 * Features:
 * - Specialized error messages for voice-related failures
 * - Option to switch to text chat
 * - Graceful call ending
 * - Sentry logging with voice context
 */
export class VoiceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
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
    // Log to Sentry with voice context
    Sentry.withScope((scope) => {
      scope.setTag("error-boundary", "voice");
      scope.setTag("error-id", this.state.errorId);
      scope.setContext("voice", {
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== "undefined" ? navigator.userAgent : "",
      });
      scope.setExtras({
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
      });
      Sentry.captureException(error);
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: `voice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleSwitchToText = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    
    if (this.props.onSwitchToText) {
      this.props.onSwitchToText();
    }
  };

  handleEndCall = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    
    if (this.props.onEndCall) {
      this.props.onEndCall();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-zinc-950 rounded-[32px]">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
              <Mic className="w-10 h-10 text-red-400" />
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Voice Connection Lost
              </h2>
              <p className="text-zinc-400">
                We encountered an issue with the voice assistant. 
                Your conversation history has been saved.
              </p>
            </div>

            {/* Error Details (dev mode only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="text-left p-4 rounded-lg bg-zinc-900 border border-zinc-800 overflow-auto max-h-48">
                <p className="text-sm font-mono text-red-400 mb-2">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Error ID */}
            <p className="text-xs text-zinc-500">
              Error ID: <code className="font-mono bg-zinc-900 px-1 py-0.5 rounded">{this.state.errorId}</code>
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                onClick={this.handleRetry} 
                className="gap-2 bg-white text-black hover:bg-white/90"
              >
                <RefreshCw className="w-4 h-4" />
                Reconnect Voice
              </Button>
              <Button 
                variant="outline" 
                onClick={this.handleSwitchToText}
                className="gap-2 border-zinc-700 text-white hover:bg-zinc-800"
              >
                <MessageSquare className="w-4 h-4" />
                Switch to Text
              </Button>
              <Button 
                variant="ghost" 
                onClick={this.handleEndCall}
                className="gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default VoiceErrorBoundary;
