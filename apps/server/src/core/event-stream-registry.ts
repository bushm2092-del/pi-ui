import type { WorkerEventMessage } from "@pi/protocol";

interface BufferedEvent {
  message: WorkerEventMessage;
  bytes: number;
}

interface EventStreamState {
  runtimeSlotId: string;
  events: BufferedEvent[];
  totalBytes: number;
  latestCursor: number;
  touchedAt: number;
}

export type ReplayResetReason = "stream_missing" | "cursor_expired" | "stream_replaced";

export interface EventStreamAttachment {
  streamId?: string;
  latestCursor?: number;
  replay: WorkerEventMessage[];
  resetReason?: ReplayResetReason;
  unsubscribe(): void;
}

export interface EventStreamRegistryOptions {
  maxEventsPerStream?: number;
  maxBytesPerStream?: number;
  maxStreams?: number;
}

export class EventStreamRegistry {
  #streams = new Map<string, EventStreamState>();
  #streamByRuntime = new Map<string, string>();
  #listeners = new Set<(event: WorkerEventMessage) => void>();
  #maxEventsPerStream: number;
  #maxBytesPerStream: number;
  #maxStreams: number;

  constructor(options: EventStreamRegistryOptions = {}) {
    this.#maxEventsPerStream = options.maxEventsPerStream ?? 2_000;
    this.#maxBytesPerStream = options.maxBytesPerStream ?? 8 * 1024 * 1024;
    this.#maxStreams = options.maxStreams ?? 256;
  }

  append(event: WorkerEventMessage): void {
    if (!event.runtimeSlotId) return;
    let stream = this.#streams.get(event.streamId);
    if (!stream) {
      stream = {
        runtimeSlotId: event.runtimeSlotId,
        events: [],
        totalBytes: 0,
        latestCursor: 0,
        touchedAt: Date.now()
      };
      this.#streams.set(event.streamId, stream);
    }
    if (event.cursor <= stream.latestCursor) return;
    const bytes = Buffer.byteLength(JSON.stringify(event));
    stream.events.push({ message: event, bytes });
    stream.totalBytes += bytes;
    stream.latestCursor = event.cursor;
    stream.touchedAt = Date.now();
    this.#streamByRuntime.set(event.runtimeSlotId, event.streamId);
    while (
      stream.events.length > this.#maxEventsPerStream ||
      stream.totalBytes > this.#maxBytesPerStream
    ) {
      const removed = stream.events.shift();
      if (removed) stream.totalBytes -= removed.bytes;
    }
    this.#pruneStreams();
    for (const listener of this.#listeners) listener(event);
  }

  attach(
    runtimeSlotId: string,
    resume: { streamId: string; afterCursor: number } | undefined,
    listener: (event: WorkerEventMessage) => void
  ): EventStreamAttachment {
    const currentStreamId = this.#streamByRuntime.get(runtimeSlotId);
    const current = currentStreamId ? this.#streams.get(currentStreamId) : undefined;
    let replay: WorkerEventMessage[] = [];
    let resetReason: ReplayResetReason | undefined;

    if (resume) {
      const requested = this.#streams.get(resume.streamId);
      if (!requested) {
        resetReason = "stream_missing";
      } else if (requested.runtimeSlotId !== runtimeSlotId || currentStreamId !== resume.streamId) {
        resetReason = "stream_replaced";
      } else {
        const earliestCursor = requested.events[0]?.message.cursor ?? requested.latestCursor + 1;
        if (resume.afterCursor > requested.latestCursor || resume.afterCursor < earliestCursor - 1) {
          resetReason = "cursor_expired";
        } else {
          replay = requested.events
            .filter(({ message }) => message.cursor > resume.afterCursor)
            .map(({ message }) => message);
        }
      }
    }

    const filtered = (event: WorkerEventMessage) => {
      if (event.runtimeSlotId === runtimeSlotId) listener(event);
    };
    this.#listeners.add(filtered);
    return {
      streamId: currentStreamId,
      latestCursor: current?.latestCursor,
      replay,
      resetReason,
      unsubscribe: () => this.#listeners.delete(filtered)
    };
  }

  #pruneStreams(): void {
    if (this.#streams.size <= this.#maxStreams) return;
    const oldest = [...this.#streams.entries()].sort((a, b) => a[1].touchedAt - b[1].touchedAt);
    for (const [streamId, stream] of oldest.slice(0, this.#streams.size - this.#maxStreams)) {
      this.#streams.delete(streamId);
      if (this.#streamByRuntime.get(stream.runtimeSlotId) === streamId) {
        this.#streamByRuntime.delete(stream.runtimeSlotId);
      }
    }
  }
}
