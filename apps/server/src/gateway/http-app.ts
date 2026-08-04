import { randomUUID } from "node:crypto";
import express, { type ErrorRequestHandler, type Request, type Response } from "express";
import type { PromptRuntimeRequestDto } from "@pi/protocol";
import { StorageLeaseConflictError } from "../core/storage-lease-manager.js";
import { RuntimeNotFoundError, RuntimeService } from "../modules/runtimes/runtime-service.js";
import { WorkerOperationError } from "../supervisors/agent-worker-process.js";
import { isGatewayAuthorized, isOriginAllowed } from "./gateway-security.js";

const MAX_REQUEST_BODY = "1mb";

export interface CreatePiHttpAppOptions {
  runtimeService: RuntimeService;
  token: string;
  allowedOrigins?: string[];
}

export function createPiHttpApp(options: CreatePiHttpAppOptions): express.Express {
  const app = express();
  app.disable("x-powered-by");
  app.use((request, response, next) => {
    const requestId = request.get("x-request-id") || randomUUID();
    response.locals.requestId = requestId;
    response.setHeader("x-request-id", requestId);
    response.setHeader("x-content-type-options", "nosniff");
    response.setHeader("cache-control", "no-store");
    const origin = request.get("origin");
    if (origin && isOriginAllowed(request, options.allowedOrigins)) {
      response.setHeader("access-control-allow-origin", origin);
      response.setHeader("vary", "Origin");
      response.setHeader("access-control-allow-headers", "authorization, content-type, x-request-id");
      response.setHeader("access-control-allow-methods", "GET, POST, PATCH, DELETE, OPTIONS");
    }
    if (request.method === "OPTIONS") {
      if (!isOriginAllowed(request, options.allowedOrigins)) {
        sendError(response, 403, "origin_forbidden", "Origin is not allowed");
      } else {
        response.sendStatus(204);
      }
      return;
    }
    next();
  });

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use((request, response, next) => {
    if (!isOriginAllowed(request, options.allowedOrigins)) {
      sendError(response, 403, "origin_forbidden", "Origin is not allowed");
      return;
    }
    if (!isGatewayAuthorized(request, options.token)) {
      sendError(response, 401, "unauthorized", "Authentication is required");
      return;
    }
    next();
  });
  app.use(express.json({ limit: MAX_REQUEST_BODY, strict: true }));

  app.post("/v1/runtimes", async (request, response) => {
    const result = await options.runtimeService.create(parseCreateRuntimeBody(request.body));
    response.status(201).json(result);
  });

  app.get("/v1/runtimes/:runtimeSlotId", async (request, response) => {
    response.json(await options.runtimeService.get(readRuntimeSlotId(request)));
  });

  app.post("/v1/runtimes/:runtimeSlotId/prompt", async (request, response) => {
    response.json(await options.runtimeService.prompt(
      readRuntimeSlotId(request),
      parsePromptBody(request.body)
    ));
  });

  app.post("/v1/runtimes/:runtimeSlotId/abort", async (request, response) => {
    response.json(await options.runtimeService.abort(readRuntimeSlotId(request)));
  });

  app.patch("/v1/runtimes/:runtimeSlotId", async (request, response) => {
    const sessionName = readRequiredString(readRecord(request.body).sessionName, "sessionName");
    response.json(await options.runtimeService.rename(readRuntimeSlotId(request), sessionName));
  });

  app.delete("/v1/runtimes/:runtimeSlotId", async (request, response) => {
    await options.runtimeService.remove(readRuntimeSlotId(request));
    response.sendStatus(204);
  });

  app.use((_request, response) => {
    sendError(response, 404, "route_not_found", "Route not found");
  });

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof RuntimeNotFoundError) {
      sendError(response, 404, "runtime_not_found", error.message);
      return;
    }
    if (error instanceof StorageLeaseConflictError) {
      sendError(response, 409, "storage_lease_conflict", error.message);
      return;
    }
    if (error instanceof InvalidRequestError) {
      sendError(response, error.status, error.code, error.message);
      return;
    }
    if (error instanceof WorkerOperationError) {
      sendError(response, 409, error.details.code, error.message, error.details.retryable);
      return;
    }
    const parserError = readParserError(error);
    if (parserError) {
      sendError(response, parserError.status, parserError.code, parserError.message);
      return;
    }
    sendError(response, 500, "internal_error", "Internal server error");
  };
  app.use(errorHandler);
  return app;
}

class InvalidRequestError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
  }
}

function parseCreateRuntimeBody(value: unknown) {
  const body = readRecord(value);
  return {
    runtimeSlotId: readOptionalString(body.runtimeSlotId, "runtimeSlotId"),
    cwd: readRequiredString(body.cwd, "cwd"),
    agentDir: readOptionalString(body.agentDir, "agentDir"),
    sessionFile: readOptionalString(body.sessionFile, "sessionFile")
  };
}

function parsePromptBody(value: unknown): PromptRuntimeRequestDto {
  const body = readRecord(value);
  const streamingBehavior = body.streamingBehavior;
  if (streamingBehavior !== undefined && streamingBehavior !== "steer" && streamingBehavior !== "followUp") {
    throw new InvalidRequestError(400, "invalid_request", "streamingBehavior must be steer or followUp");
  }
  return { message: readRequiredString(body.message, "message"), streamingBehavior };
}

function readRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new InvalidRequestError(400, "invalid_request", "Request body must be an object");
  }
  return value as Record<string, unknown>;
}

function readRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new InvalidRequestError(400, "invalid_request", `${field} must be a non-empty string`);
  }
  return value;
}

function readOptionalString(value: unknown, field: string): string | undefined {
  return value === undefined ? undefined : readRequiredString(value, field);
}

function readRuntimeSlotId(request: Request): string {
  const value = request.params.runtimeSlotId;
  if (typeof value !== "string" || !value) throw new InvalidRequestError(400, "invalid_request", "runtimeSlotId is required");
  return value;
}

function sendError(
  response: Response,
  status: number,
  code: string,
  message: string,
  retryable = false
): void {
  response.status(status).json({
    error: {
      code,
      message,
      retryable,
      requestId: String(response.locals.requestId ?? "")
    }
  });
}

function readParserError(error: unknown): { status: number; code: string; message: string } | undefined {
  if (!error || typeof error !== "object") return undefined;
  const record = error as Record<string, unknown>;
  if (record.type === "entity.too.large") {
    return { status: 413, code: "body_too_large", message: "Request body is too large" };
  }
  if (record.type === "entity.parse.failed") {
    return { status: 400, code: "invalid_json", message: "Request body must be valid JSON" };
  }
  return undefined;
}
