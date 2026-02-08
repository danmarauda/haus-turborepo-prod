import React, { useEffect, useState, useRef } from 'react';
import { View, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import type { Message } from 'ai';
import { Image } from 'expo-image';
import { CustomMarkdown } from '../ui/markdown';
import { WelcomeMessage } from './welcome-message';
import { cn } from '../../lib/utils';

export type ExtendedMessage = Message & {
  parts?: Array<{ type: 'text' | 'image'; text?: string; image?: string }>;
  metadata?: {
    isVoiceMessage?: boolean;
  };
  toolInvocations?: Array<{
    toolName: string;
    toolCallId: string;
    state: string;
    result?: any;
  }>;
};

interface ChatInterfaceProps {
  messages: ExtendedMessage[];
  scrollViewRef: React.RefObject<ScrollView>;
  isLoading?: boolean;
  generatingImage?: boolean;
}

const ChatImage = ({ url }: { url: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const imageUri =
    url.startsWith('blob:') || url.startsWith('http') || url.startsWith('https')
      ? url
      : `https://${url}`;

  if (error) {
    return (
      <View className="pb-4">
        <View className="aspect-square w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
          <ActivityIndicator size="small" />
        </View>
      </View>
    );
  }

  return (
    <View className="pb-4">
      <View className="relative aspect-square w-full">
        <Image
          source={{ uri: imageUri }}
          className="aspect-square w-full rounded-lg"
          contentFit="cover"
          transition={300}
          onLoadStart={() => {
            setLoading(true);
            setError(false);
          }}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
        {loading && (
          <View className="absolute inset-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            <ActivityIndicator size="small" />
          </View>
        )}
      </View>
    </View>
  );
};

export const ChatInterface = ({
  messages,
  scrollViewRef,
  isLoading,
  generatingImage,
  ref,
}: ChatInterfaceProps & { ref?: React.Ref<ScrollView> }) => {
    const [messageHeights, setMessageHeights] = useState<{
      lastUserHeight: number;
      lastBotHeight: number;
    }>({
      lastUserHeight: 0,
      lastBotHeight: 0,
    });

    const { height: windowHeight } = useWindowDimensions();
    const chatInputHeight = 60;
    const visibleWindowHeight = windowHeight - 100 - chatInputHeight;

    const scrollToEnd = () => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    };

    useEffect(() => {
      // Scroll to end when new messages arrive
      if (messages.length > 0) {
        setTimeout(scrollToEnd, 100);
      }
    }, [messages.length]);

    const renderContent = (m: ExtendedMessage) => {
      // Use parts array if available
      if (m.parts && Array.isArray(m.parts) && m.parts.length > 0) {
        return m.parts.map((part: any, index: number) => {
          if (part.type === 'image' && part.image) {
            return <ChatImage key={index} url={part.image} />;
          }
          if (
            part.type === 'text' &&
            part.text &&
            typeof part.text === 'string' &&
            part.text.trim()
          ) {
            return (
              <CustomMarkdown
                key={index}
                content={part.text}
                isVoiceMessage={m.metadata?.isVoiceMessage}
              />
            );
          }
          return null;
        });
      }

      // Fallback for string content
      if (typeof m.content === 'string' && m.content && m.content.trim()) {
        return (
          <CustomMarkdown
            content={m.content}
            isVoiceMessage={m.metadata?.isVoiceMessage}
          />
        );
      }

      // Handle legacy content array format
      if (Array.isArray(m.content) && m.content.length > 0) {
        return m.content.map((item: any, index: number) => {
          if (
            item.type === 'text' &&
            item.text &&
            typeof item.text === 'string' &&
            item.text.trim()
          ) {
            return (
              <CustomMarkdown
                key={index}
                content={item.text}
                isVoiceMessage={m.metadata?.isVoiceMessage}
              />
            );
          }
          if (item.type === 'image' && item.image) {
            return <ChatImage key={index} url={item.image} />;
          }
          return null;
        });
      }

      return null;
    };

    const hasContent = (m: ExtendedMessage) => {
      if (m.role === 'user') {
        if (m.parts && Array.isArray(m.parts) && m.parts.length > 0) {
          return m.parts.some(
            (part: any) =>
              part.type === 'text' &&
              part.text &&
              typeof part.text === 'string' &&
              part.text.trim()
          );
        }
        if (typeof m.content === 'string' && m.content && m.content.trim()) {
          return true;
        }
        return false;
      }

      if (m.parts && Array.isArray(m.parts) && m.parts.length > 0) {
        return m.parts.some(
          (part: any) =>
            (part.type === 'text' &&
              part.text &&
              typeof part.text === 'string' &&
              part.text.trim()) ||
            (part.type === 'image' && part.image)
        );
      }

      if (typeof m.content === 'string' && m.content && m.content.trim()) {
        return m.content.length > 0;
      }
      if (Array.isArray(m.content) && m.content) {
        return m.content.some(
          (item: any) =>
            (item.type === 'text' &&
              item.text &&
              typeof item.text === 'string' &&
              item.text.trim()) ||
            (item.type === 'image' && item.image)
        );
      }
      return false;
    };

    return (
      <View className="flex-1">
        <ScrollView ref={ref} className="flex-1 space-y-4 p-4">
          {!messages?.length && <WelcomeMessage />}
          {messages && messages.length > 0
            ? messages.map((m, index) => (
                <React.Fragment key={m.id}>
                  {m.toolInvocations?.map((t) => {
                    if (t.toolName === 'getWeather') {
                      if (t.state !== 'result') {
                        return (
                          <View
                            key={t.toolCallId}
                            className={cn(
                              'mt-4 max-w-[85%] rounded-2xl bg-muted/50 p-4'
                            )}
                          >
                            <ActivityIndicator size="small" />
                          </View>
                        );
                      }
                      // Weather result rendering could be added here
                    }
                    return null;
                  })}

                  {/* Render images separately for user messages */}
                  {m.role === 'user' &&
                    m.parts &&
                    Array.isArray(m.parts) && (
                      <>
                        {m.parts
                          .filter(
                            (part: any) =>
                              part.type === 'image' && part.image
                          )
                          .map((part: any, imgIndex: number) => (
                            <View
                              key={`img-${imgIndex}`}
                              className="ml-auto mb-2 max-w-[85%]"
                            >
                              <ChatImage url={part.image} />
                            </View>
                          ))}
                      </>
                    )}

                  {/* Render text content */}
                  <View
                    className={cn(
                      'flex-row rounded-3xl px-4',
                      m.role === 'user'
                        ? 'ml-auto max-w-[85%] bg-muted/50'
                        : 'max-w-[95%] pl-0'
                    )}
                    onLayout={(event) => {
                      if (index >= messages.length - 2) {
                        const { height } = event.nativeEvent.layout;
                        setMessageHeights((prev) => ({
                          ...prev,
                          [m.role === 'user'
                            ? 'lastUserHeight'
                            : 'lastBotHeight']: height,
                        }));
                      }
                    }}
                  >
                    {hasContent(m) && (
                      <>
                        <View
                          className={
                            m.role === 'user'
                              ? ''
                              : 'mr-2 mt-1 h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700'
                          }
                        >
                          <ActivityIndicator
                            size="small"
                            hidesWhenStopped
                            color={m.role === 'user' ? '#000' : '#fff'}
                          />
                        </View>
                        {m.role === 'user' ? (
                          <View className="flex-1">
                            {m.parts && Array.isArray(m.parts) ? (
                              m.parts
                                .filter(
                                  (part: any) =>
                                    part.type === 'text' &&
                                    part.text &&
                                    part.text.trim()
                                )
                                .map((part: any, index: number) => (
                                  <CustomMarkdown
                                    key={index}
                                    content={part.text}
                                    isVoiceMessage={m.metadata?.isVoiceMessage}
                                  />
                                ))
                            ) : typeof m.content === 'string' &&
                              m.content.trim() ? (
                              <CustomMarkdown
                                content={m.content}
                                isVoiceMessage={m.metadata?.isVoiceMessage}
                              />
                            ) : null}
                          </View>
                        ) : (
                          renderContent(m)
                        )}
                      </>
                    )}
                  </View>

                  {(isLoading || generatingImage) &&
                    messages?.length > 0 &&
                    messages[messages.length - 1].role === 'user' &&
                    m === messages[messages.length - 1] && (
                      <View className="flex-row">
                        <View className="mr-2 mt-1 h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700" />
                        <View className="-ml-2 -mt-[1px]">
                          <ActivityIndicator size="small" />
                        </View>
                      </View>
                    )}
                </React.Fragment>
              ))
            : null}
        </ScrollView>
      </View>
    );
  };

ChatInterface.displayName = 'ChatInterface';
