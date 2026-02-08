/**
 * AI Components Index
 *
 * Export all AI-related components for easy importing.
 */

// Chat components
export { ChatContainer, CompactChat } from './ChatContainer';
export { PropertyChat, PropertyChatButton, InlinePropertyChat } from './PropertyChat';

// Message components
export { 
  Message, 
  MessageContent, 
  MessageBubble, 
  MessageActions, 
  MessageToolbar,
  MessageAvatar 
} from './Message';

export type { 
  MessageProps, 
  MessageContentProps, 
  MessageBubbleProps, 
  MessageActionsProps, 
  MessageToolbarProps,
  MessageAvatarProps,
  MessageRole,
  MessageContentPart 
} from './Message';

// Property image analyzer
export { PropertyImageAnalyzer } from './PropertyImageAnalyzer';
export type { PropertyImageAnalyzerProps } from './PropertyImageAnalyzer';
