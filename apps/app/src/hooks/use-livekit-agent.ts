"use client";

import type { AgentState, ReceivedMessage } from "@livekit/components-react";
import { ConnectionState, Room, RoomEvent, Track } from "livekit-client";
import { useCallback, useState } from "react";

type UseLiveKitAgentOptions = {
  onAgentMessage?: (message: string) => void;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
};

type UseLiveKitAgentReturn = {
  room: Room | null;
  isConnected: boolean;
  isConnecting: boolean;
  agentState: AgentState;
  messages: ReceivedMessage[];
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: string) => Promise<void>;
};

export function useLiveKitAgent(
  options: UseLiveKitAgentOptions = {}
): UseLiveKitAgentReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [messages, setMessages] = useState<ReceivedMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) {
      return;
    }

    setIsConnecting(true);
    setAgentState("connecting");
    setError(null);

    try {
      // Fetch token from API
      const response = await fetch("/api/livekit-token");
      const data = await response.json();

      if (!response.ok) {
        const errorMsg =
          data.hint || data.error || "Failed to get LiveKit credentials";
        setError(errorMsg);
        console.error("LiveKit setup error:", errorMsg);
        setAgentState("disconnected");
        setIsConnecting(false);
        options.onError?.(new Error(errorMsg));
        return;
      }

      // Handle sandbox mode
      if (data.sandbox) {
        setError(
          "Sandbox mode not fully implemented. Please configure LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL."
        );
        setAgentState("disconnected");
        setIsConnecting(false);
        return;
      }

      const { token, url } = data;

      if (!(token && url)) {
        const errorMsg = "Missing token or URL from LiveKit API";
        setError(errorMsg);
        setAgentState("disconnected");
        setIsConnecting(false);
        return;
      }

      // Create and connect room
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      // Set up event listeners
      newRoom.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        setIsConnected(state === ConnectionState.Connected);
        if (state === ConnectionState.Disconnected) {
          setAgentState("disconnected");
        }
      });

      newRoom.on(RoomEvent.DataReceived, (payload: Uint8Array, participant) => {
        const decoder = new TextDecoder();
        const message = decoder.decode(payload);

        try {
          const data = JSON.parse(message);

          // Handle agent state updates
          if (data.type === "agent_state") {
            setAgentState(data.state as AgentState);
          }

          // Handle chat messages
          if (data.type === "message" || data.type === "transcript") {
            const newMessage: ReceivedMessage = {
              id: crypto.randomUUID(),
              message: data.content || data.text,
              timestamp: Date.now(),
              from: participant
                ? {
                    identity: participant.identity,
                    isLocal: participant.isLocal,
                  }
                : undefined,
            };
            setMessages((prev) => [...prev, newMessage]);

            if (!participant?.isLocal && options.onAgentMessage) {
              options.onAgentMessage(data.content || data.text);
            }
          }

          // Handle transcription updates
          if (data.type === "transcription" && options.onTranscript) {
            options.onTranscript(data.text, data.isFinal);
          }
        } catch {
          // Plain text message
          console.log("Received data:", message);
        }
      });

      newRoom.on(
        RoomEvent.TrackSubscribed,
        (track, _publication, participant) => {
          if (track.kind === Track.Kind.Audio && !participant.isLocal) {
            // Agent audio track - the agent is speaking
            setAgentState("speaking");
          }
        }
      );

      newRoom.on(
        RoomEvent.TrackUnsubscribed,
        (track, _publication, participant) => {
          if (track.kind === Track.Kind.Audio && !participant.isLocal) {
            setAgentState("listening");
          }
        }
      );

      await newRoom.connect(url, token);
      setRoom(newRoom);
      setAgentState("listening");
    } catch (error) {
      console.error("Failed to connect to LiveKit:", error);
      setAgentState("disconnected");
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, options]);

  const disconnect = useCallback(() => {
    if (room) {
      room.disconnect();
      setRoom(null);
      setIsConnected(false);
      setAgentState("disconnected");
    }
  }, [room]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!(room && isConnected)) {
        console.warn("Cannot send message: not connected");
        return;
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(
        JSON.stringify({
          type: "message",
          content: message,
        })
      );

      await room.localParticipant.publishData(data, { reliable: true });

      // Add to local messages
      const newMessage: ReceivedMessage = {
        id: crypto.randomUUID(),
        message,
        timestamp: Date.now(),
        from: {
          identity: room.localParticipant.identity,
          isLocal: true,
        },
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    [room, isConnected]
  );

  return {
    room,
    isConnected,
    isConnecting,
    agentState,
    messages,
    error,
    connect,
    disconnect,
    sendMessage,
  };
}
