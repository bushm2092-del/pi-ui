import type { Message } from "./message";

export interface Conversation {
  id: string;
  title: string;
  processingLabel: string;
  messages: Message[];
  summary: {
    sectionLabel: string;
    actionLabel: string;
  };
}
