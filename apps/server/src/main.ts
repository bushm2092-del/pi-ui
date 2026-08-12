import { startPiBackend } from "./Bootstrap/pi-backend.js";

const host = process.env.PI_UI_HOST ?? "127.0.0.1";
const configuredToken = process.env.PI_UI_TOKEN;
if (!isLoopbackHost(host) && !configuredToken) {
  throw new Error("PI_UI_TOKEN is required when binding the backend to a non-loopback host");
}
const backend = await startPiBackend({
  dataDir: process.env.PI_UI_DATA_DIR,
  token: configuredToken,
  host,
  port: readPort(process.env.PI_UI_PORT),
});

process.stdout.write(
  `${JSON.stringify({
    type: "pi-ui.backend.ready",
    ...backend.address,
    token: configuredToken ? undefined : backend.token,
  })}\n`,
);

let shuttingDown = false;
async function shutdown(exitCode = 0): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  try {
    await backend.stop();
  } finally {
    process.exit(exitCode);
  }
}

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});
process.on("uncaughtException", (error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  void shutdown(1);
});
process.on("unhandledRejection", (reason) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  process.stderr.write(`${error.stack ?? error.message}\n`);
  void shutdown(1);
});

function readPort(value: string | undefined): number {
  if (value === undefined) return 0;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65_535) throw new Error("PI_UI_PORT must be an integer from 0 to 65535");
  return port;
}

function isLoopbackHost(value: string): boolean {
  return value === "127.0.0.1" || value === "::1" || value === "localhost";
}
