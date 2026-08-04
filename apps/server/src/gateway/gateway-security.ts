import { timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";

export function isOriginAllowed(request: IncomingMessage, allowedOrigins: readonly string[] = []): boolean {
  const origin = readHeader(request, "origin");
  return !origin || allowedOrigins.includes(origin);
}

export function isGatewayAuthorized(request: IncomingMessage, token: string): boolean {
  const authorization = readHeader(request, "authorization");
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
  const protocols = readHeader(request, "sec-websocket-protocol")?.split(",").map((value) => value.trim());
  const protocolToken = protocols?.find((value) => value.startsWith("pi-ui-token."))?.slice("pi-ui-token.".length);
  return constantTimeEqual(bearer ?? protocolToken ?? "", token);
}

export function readHeader(request: IncomingMessage, name: string): string | undefined {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function constantTimeEqual(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}
