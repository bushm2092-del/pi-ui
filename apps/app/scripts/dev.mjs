import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = resolve(appRoot, "../..");
let backend;
let vite;
let stopping = false;

function run(command, args, options = {}) {
  return spawn(command, args, {
    cwd: workspaceRoot,
    stdio: ["inherit", "pipe", "inherit"],
    ...options,
  });
}

function waitForBackend(child) {
  return new Promise((resolveReady, reject) => {
    const lines = createInterface({ input: child.stdout });

    lines.on("line", (line) => {
      process.stdout.write(`${line}\n`);
      try {
        const message = JSON.parse(line);
        if (message.type === "pi-ui.backend.ready") resolveReady(message);
      } catch {
        // Backend logs are not required to be JSON.
      }
    });

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      reject(new Error(`Pi backend exited before startup (${signal ?? code})`));
    });
  });
}

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  vite?.kill("SIGTERM");
  backend?.kill("SIGTERM");
  process.exitCode = exitCode;
}

process.once("SIGINT", () => stop());
process.once("SIGTERM", () => stop());

try {
  backend = run("pnpm", ["--filter", "@pi/server", "dev"]);
  const ready = await waitForBackend(backend);
  const token = ready.token ?? process.env.PI_UI_TOKEN;
  if (!token) throw new Error("Pi backend did not provide an authentication token");

  vite = spawn("pnpm", ["exec", "vite", ...process.argv.slice(2)], {
    cwd: appRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      VITE_PI_SOCKET_URL: ready.socketUrl,
      VITE_PI_TOKEN: token,
      VITE_PI_CWD: workspaceRoot,
    },
  });
  vite.once("error", (error) => {
    console.error(error);
    stop(1);
  });
  vite.once("exit", (code) => stop(code ?? 1));
  backend.once("exit", (code) => {
    if (!stopping) {
      console.error(`Pi backend stopped unexpectedly (${code ?? "signal"})`);
      stop(1);
    }
  });
} catch (error) {
  console.error(error);
  stop(1);
}
