import { useEffect, useState } from 'react';
import { useLocalParticipant, useTrackTranscription } from '@livekit/components-react';
import { LocalParticipant, Participant, Track } from 'livekit-client';

type ChatMessageType = {
  id: string;
  message: string;
  name: string;
  isSelf: boolean;
  timestamp: number;
};

type AgentState =
  | 'disconnected'
  | 'connecting'
  | 'initializing'
  | 'speaking'
  | 'speaking-user'
  | 'listening'
  | 'thinking'
  | 'ready'
  | 'connected'
  | 'error';

export function useVoiceTranscription(voiceAssistant: any) {
  const agentMessages = useTrackTranscription(voiceAssistant?.audioTrack);
  const localParticipant = useLocalParticipant();
  const localMessages = useTrackTranscription({
    publication: localParticipant.microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant.localParticipant,
  });

  const [transcripts, setTranscripts] = useState<{
    [key: string]: ChatMessageType;
  }>({});

  useEffect(() => {
    const newTranscripts = { ...transcripts };
    let updated = false;

    agentMessages?.segments?.forEach((s: any) => {
      const newMessage = segmentToChatMessage(
        s,
        newTranscripts[s.id],
        voiceAssistant?.audioTrack?.participant,
      );
      if (newTranscripts[s.id]?.message !== newMessage.message) {
        newTranscripts[s.id] = newMessage;
        updated = true;
      }
    });

    localMessages?.segments?.forEach((s: any) => {
      const newMessage = segmentToChatMessage(
        s,
        newTranscripts[s.id],
        localParticipant.localParticipant,
      );
      if (newTranscripts[s.id]?.message !== newMessage.message) {
        newTranscripts[s.id] = newMessage;
        updated = true;
      }
    });

    if (updated) {
      setTranscripts(newTranscripts);
    }
  }, [
    agentMessages?.segments,
    localMessages?.segments,
    localParticipant?.localParticipant,
    voiceAssistant?.audioTrack?.participant,
  ]);

  const allMessages = Object.values(transcripts).map((msg) => ({
    id: msg.id,
    role: msg.isSelf ? 'user' : 'assistant',
    content: msg.message,
  }));

  return {
    transcripts,
    allMessages,
    agentMessages: agentMessages?.segments || [],
    localMessages: localMessages?.segments || [],
  };
}

function segmentToChatMessage(
  s: any,
  existingMessage: ChatMessageType | undefined,
  participant: Participant,
): ChatMessageType {
  const msg: ChatMessageType = {
    id: s.id,
    message: s.final ? s.text : `${s.text} ...`,
    name: participant instanceof LocalParticipant ? 'You' : 'Agent',
    isSelf: participant instanceof LocalParticipant,
    timestamp: existingMessage?.timestamp ?? Date.now(),
  };
  return msg;
}

export type { AgentState };
