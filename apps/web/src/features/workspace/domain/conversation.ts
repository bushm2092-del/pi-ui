import type { Message } from "./message";

export interface ConversationRuntimeState {
  isStreaming: boolean;
  isIdle: boolean;
  isCompacting: boolean;
  retryAttempt: number;
  steeringQueue: string[];
  followUpQueue: string[];
  messageSequence: number;
  thinkingLevel?: string;
  latestEntry?: unknown;
  lastEvent?: string;
}

export interface Conversation {
  id: string;
  title: string;
  processingLabel: string;
  messages: Message[];
  runtime?: ConversationRuntimeState;
  summary: {
    sectionLabel: string;
    actionLabel: string;
  };
}
