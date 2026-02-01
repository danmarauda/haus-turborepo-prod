/**
 * Message - Chat message display for React Native
 * 
 * Converted to NativeWind with preserved message bubble styling
 * Supports text + image content
 */

import React, { type ReactNode } from "react";
import { View, Text, type ViewProps } from "react-native";
import { Image } from "expo-image";
import { cn } from "../../lib/utils";

export type MessageRole = "user" | "assistant" | "system";

export interface MessageContentPart {
  type: "text" | "image";
  text?: string;
  image?: string;
}

export interface MessageProps extends Omit<ViewProps, "role"> {
  messageRole?: MessageRole;
  children?: ReactNode;
  className?: string;
}

export const Message = ({
  messageRole = "assistant",
  children,
  className,
  ...props
}: MessageProps) => {
  const isUser = messageRole === "user";

  return (
    <View
      className={cn(
        "py-2",
        isUser ? "items-end" : "items-start",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
};

export interface MessageContentProps extends ViewProps {
  children?: ReactNode;
  className?: string;
}

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <View 
    className={cn(
      "max-w-[85%] rounded-2xl border border-border bg-card p-3",
      className
    )} 
    {...props}
  >
    {typeof children === "string" ? (
      <Text className="text-base leading-5 text-foreground">{children}</Text>
    ) : (
      children
    )}
  </View>
);

export interface MessageBubbleProps extends Omit<ViewProps, 'role'> {
  messageRole: MessageRole;
  content?: string;
  parts?: MessageContentPart[];
  isVoiceMessage?: boolean;
  className?: string;
}

export const MessageBubble = ({
  messageRole,
  content,
  parts,
  isVoiceMessage,
  className,
  ...props
}: MessageBubbleProps) => {
  const isUser = messageRole === "user";

  const renderContent = () => {
    // If parts array is available, render each part
    if (parts && parts.length > 0) {
      return parts.map((part, index) => {
        if (part.type === "image" && part.image) {
          return (
            <View key={index} className="mb-2 overflow-hidden rounded-lg">
              <Image
                source={{ uri: part.image }}
                className="h-48 w-full"
                contentFit="cover"
                transition={300}
              />
            </View>
          );
        }
        if (part.type === "text" && part.text) {
          return (
            <Text 
              key={index} 
              className={cn(
                "text-base leading-5",
                isVoiceMessage && "italic",
                isUser ? "text-foreground" : "text-foreground"
              )}
            >
              {part.text}
            </Text>
          );
        }
        return null;
      });
    }

    // Fallback to content string
    if (content) {
      return (
        <Text 
          className={cn(
            "text-base leading-5",
            isVoiceMessage && "italic"
          )}
        >
          {content}
        </Text>
      );
    }

    return null;
  };

  return (
    <View
      className={cn(
        "max-w-[85%] rounded-2xl border p-3",
        isUser 
          ? "ml-auto border-transparent bg-primary text-primary-foreground" 
          : "border-border bg-card",
        className
      )}
      {...props}
    >
      {renderContent()}
    </View>
  );
};

export interface MessageActionsProps extends ViewProps {
  children?: ReactNode;
  className?: string;
}

export const MessageActions = ({
  children,
  className,
  ...props
}: MessageActionsProps) => (
  <View className={cn("mt-1 flex-row gap-1", className)} {...props}>
    {children}
  </View>
);

export interface MessageToolbarProps extends ViewProps {
  children?: ReactNode;
  className?: string;
}

export const MessageToolbar = ({
  children,
  className,
  ...props
}: MessageToolbarProps) => (
  <View 
    className={cn("mt-2 flex-row gap-2 opacity-50", className)} 
    {...props}
  >
    {children}
  </View>
);

export interface MessageAvatarProps extends ViewProps {
  fallback?: string;
  className?: string;
}

export const MessageAvatar = ({
  fallback,
  className,
  ...props
}: MessageAvatarProps) => (
  <View 
    className={cn(
      "mr-2 mt-1 h-8 w-8 items-center justify-center rounded-full bg-muted",
      className
    )} 
    {...props}
  >
    {fallback && (
      <Text className="text-sm font-medium text-muted-foreground">
        {fallback}
      </Text>
    )}
  </View>
);

export default Message;
