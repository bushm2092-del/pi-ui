import { execFileSync, spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = resolve(appRoot, "../..");
let backend;
let vite;
let stopping = false;

function getDevPort(args) {
  const portFlagIndex = args.findIndex((arg) => arg === "--port" || arg === "-p");
  const inlinePort = args.find((arg) => arg.startsWith("--port="));
  const value = inlinePort?.slice("--port=".length) ?? (portFlagIndex >= 0 ? args[portFlagIndex + 1] : undefined);
  const port = Number(value ?? 5173);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid development server port: ${value}`);
  }

  return port;
}

function assertPortAvailable(port) {
  return new Promise((resolveAvailable, reject) => {
    const server = createServer();

    server.once("error", (error) => {
      if (error.code !== "EADDRINUSE") {
        reject(error);
        return;
      }

      console.error(`\nDevelopment server port ${port} is already in use.\n`);
      console.error("Find and stop the process occupying it:");
      console.error(`  lsof -nP -iTCP:${port} -sTCP:LISTEN`);
      console.error(`  kill $(lsof -tiTCP:${port} -sTCP:LISTEN)\n`);
      console.error("Or start this project on another port:");
      console.error(`  npm run dev -- --port ${port + 1}\n`);
      const portError = new Error(`Port ${port} is already in use`);
      portError.instructionsShown = true;
      reject(portError);
    });

    server.once("listening", () => {
      server.close((error) => (error ? reject(error) : resolveAvailable()));
    });

    server.listen(port, "127.0.0.1");
  });
}

function isPortAvailable(port) {
  return new Promise((resolveAvailable, reject) => {
    const server = createServer();
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") resolveAvailable(false);
      else reject(error);
    });
    server.once("listening", () => {
      server.close((error) => (error ? reject(error) : resolveAvailable(true)));
    });
    server.listen(port, "127.0.0.1");
  });
}

function getListeningProcessIds(port) {
  if (process.platform === "win32") {
    const output = execFileSync("netstat", ["-ano", "-p", "tcp"], {
      encoding: "utf8",
    });
    const processIds = output
      .split(/\r?\n/)
      .map((line) => line.trim().split(/\s+/))
      .filter((columns) => columns.length >= 5 && columns[1]?.endsWith(`:${port}`) && columns[3] === "LISTENING")
      .map((columns) => Number(columns[4]));
    return [...new Set(processIds.filter(Number.isInteger))];
  }

  try {
    const output = execFileSync("lsof", ["-tiTCP:" + port, "-sTCP:LISTEN"], { encoding: "utf8" });
    return [...new Set(output.trim().split(/\s+/).map(Number).filter(Number.isInteger))];
  } catch (error) {
    if (error.status === 1) return [];
    throw error;
  }
}

function terminateProcesses(processIds) {
  for (const processId of processIds) {
    if (processId === process.pid) continue;

    console.log(`Stopping process ${processId} occupying the development port...`);
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/PID", String(processId), "/T", "/F"], {
        stdio: "inherit",
      });
    } else {
      process.kill(processId, "SIGKILL");
    }
  }
}

async function waitForPortRelease(port, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isPortAvailable(port)) return;
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }

  throw new Error(`Port ${port} was not released after stopping its process`);
}

async function releasePort(port) {
  const processIds = getListeningProcessIds(port);
  if (processIds.length === 0) return;

  terminateProcesses(processIds);
  await waitForPortRelease(port);
  console.log(`Development port ${port} is now available.\n`);
}

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
  const scriptArgs = process.argv.slice(2);
  const forceKillPort = scriptArgs.includes("--kill-port");
  const viteArgs = scriptArgs.filter((arg) => arg !== "--kill-port");
  const devPort = getDevPort(viteArgs);

  if (forceKillPort) await releasePort(devPort);
  await assertPortAvailable(devPort);

  backend = run("pnpm", ["--filter", "@pi/server", "dev"]);
  const ready = await waitForBackend(backend);
  const token = ready.token ?? process.env.PI_UI_TOKEN;
  if (!token) throw new Error("Pi backend did not provide an authentication token");

  vite = spawn("pnpm", ["exec", "vite", ...viteArgs], {
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
  if (!error?.instructionsShown) console.error(error);
  stop(1);
}
