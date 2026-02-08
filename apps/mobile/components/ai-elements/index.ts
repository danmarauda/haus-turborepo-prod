/**
 * AI Elements Component Library for React Native
 *
 * A collection of AI-focused UI components for building chat interfaces,
 * tool visualization, reasoning displays, and more.
 *
 * Adapted from StartCN AI Elements for React Native.
 */

// Loader - Animated loading spinner
export { Loader } from "./Loader";
export type { LoaderProps } from "./Loader";

// Shimmer - Animated text loading effect
export { Shimmer } from "./Shimmer";
export type { ShimmerProps } from "./Shimmer";

// Message - Chat message display
export {
  Message,
  MessageContent,
  MessageActions,
  MessageToolbar,
} from "./Message";
export type {
  MessageProps,
  MessageContentProps,
  MessageActionsProps,
  MessageToolbarProps,
  MessageRole,
} from "./Message";

// Conversation - Chat container with auto-scroll
export {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "./Conversation";
export type {
  ConversationProps,
  ConversationContentProps,
  ConversationEmptyStateProps,
} from "./Conversation";

// Reasoning - AI thinking visualization
export {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
  useReasoning,
} from "./Reasoning";
export type {
  ReasoningProps,
  ReasoningTriggerProps,
  ReasoningContentProps,
} from "./Reasoning";

// Tool - Tool call visualization with status
export {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "./Tool";
export type {
  ToolProps,
  ToolHeaderProps,
  ToolContentProps,
  ToolInputProps,
  ToolOutputProps,
  ToolStatus,
} from "./Tool";

