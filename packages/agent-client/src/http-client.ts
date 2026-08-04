import {
  isJsonValue,
  isRuntimeSnapshotDto,
  type ApiErrorDto,
  type CreateRuntimeRequestDto,
  type PromptRuntimeRequestDto,
  type RuntimeSnapshotDto
} from "@pi/protocol";

export interface RuntimeHttpClientOptions {
  baseUrl: string;
  token: string;
  fetch?: typeof globalThis.fetch;
}

export class PiApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly retryable: boolean,
    readonly requestId?: string
  ) {
    super(message);
    this.name = "PiApiError";
  }
}

export class RuntimeHttpClient {
  #baseUrl: string;
  #token: string;
  #fetch: typeof globalThis.fetch;

  constructor(options: RuntimeHttpClientOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/$/, "");
    this.#token = options.token;
    this.#fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  create(input: CreateRuntimeRequestDto, signal?: AbortSignal): Promise<RuntimeSnapshotDto> {
    return this.#snapshotRequest("/v1/runtimes", { method: "POST", body: JSON.stringify(input), signal });
  }

  get(runtimeSlotId: string, signal?: AbortSignal): Promise<RuntimeSnapshotDto> {
    return this.#snapshotRequest(this.#runtimePath(runtimeSlotId), { method: "GET", signal });
  }

  prompt(
    runtimeSlotId: string,
    input: PromptRuntimeRequestDto,
    signal?: AbortSignal
  ): Promise<RuntimeSnapshotDto> {
    return this.#snapshotRequest(`${this.#runtimePath(runtimeSlotId)}/prompt`, {
      method: "POST",
      body: JSON.stringify(input),
      signal
    });
  }

  abort(runtimeSlotId: string, signal?: AbortSignal): Promise<RuntimeSnapshotDto> {
    return this.#snapshotRequest(`${this.#runtimePath(runtimeSlotId)}/abort`, { method: "POST", signal });
  }

  rename(runtimeSlotId: string, sessionName: string, signal?: AbortSignal): Promise<RuntimeSnapshotDto> {
    return this.#snapshotRequest(this.#runtimePath(runtimeSlotId), {
      method: "PATCH",
      body: JSON.stringify({ sessionName }),
      signal
    });
  }

  async remove(runtimeSlotId: string, signal?: AbortSignal): Promise<void> {
    await this.#request(this.#runtimePath(runtimeSlotId), { method: "DELETE", signal });
  }

  async #snapshotRequest(path: string, init: RequestInit): Promise<RuntimeSnapshotDto> {
    const value = await this.#request(path, init);
    if (!isJsonValue(value) || !isRuntimeSnapshotDto(value)) {
      throw new PiApiError(502, "invalid_server_response", "Server returned an invalid Runtime snapshot", false);
    }
    return value;
  }

  async #request(path: string, init: RequestInit): Promise<unknown> {
    const response = await this.#fetch(`${this.#baseUrl}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${this.#token}`,
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...init.headers
      }
    });
    if (response.status === 204) return undefined;
    const value = await readResponseJson(response);
    if (!response.ok) throw toApiError(response.status, value);
    return value;
  }

  #runtimePath(runtimeSlotId: string): string {
    return `/v1/runtimes/${encodeURIComponent(runtimeSlotId)}`;
  }
}

async function readResponseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new PiApiError(response.status, "invalid_server_response", "Server returned invalid JSON", false);
  }
}

function toApiError(status: number, value: unknown): PiApiError {
  const error = readApiError(value);
  return new PiApiError(
    status,
    error?.error.code ?? "http_error",
    error?.error.message ?? `Request failed with status ${status}`,
    error?.error.retryable ?? false,
    error?.error.requestId
  );
}

function readApiError(value: unknown): ApiErrorDto | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const error = (value as Record<string, unknown>).error;
  if (!error || typeof error !== "object" || Array.isArray(error)) return undefined;
  const fields = error as Record<string, unknown>;
  if (
    typeof fields.code !== "string" ||
    typeof fields.message !== "string" ||
    typeof fields.retryable !== "boolean" ||
    typeof fields.requestId !== "string"
  ) return undefined;
  return { error: {
    code: fields.code,
    message: fields.message,
    retryable: fields.retryable,
    requestId: fields.requestId
  } };
}
