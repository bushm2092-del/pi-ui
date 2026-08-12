import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const desktopRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = resolve(desktopRoot, "../..");
const appHost = "127.0.0.1";
let vite;
let electron;
let stopping = false;

function run(command, args, options = {}) {
  return spawn(command, args, { cwd: workspaceRoot, stdio: "inherit", ...options });
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`Command exited with ${code}`)));
  });
}

function findAvailablePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, appHost, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Unable to allocate a Vite port"));
        return;
      }
      server.close((error) => error ? reject(error) : resolvePort(address.port));
    });
  });
}

async function waitForVite(appUrl) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(appUrl);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Vite did not become available at ${appUrl}`);
}

function stop() {
  if (stopping) return;
  stopping = true;
  electron?.kill();
  vite?.kill();
}

process.once("SIGINT", stop);
process.once("SIGTERM", stop);

try {
  await waitForExit(run("pnpm", ["--filter", "@pi/server", "build"]));
  await waitForExit(run("pnpm", ["--filter", "@pi/desktop", "build:main"]));
  const appPort = await findAvailablePort();
  const appUrl = `http://${appHost}:${appPort}`;
  vite = run("pnpm", ["--filter", "@pi/app", "dev:vite", "--port", String(appPort)]);
  await waitForVite(appUrl);
  electron = run("pnpm", ["exec", "electron", desktopRoot], { env: { ...process.env, PI_APP_URL: appUrl } });
  electron.once("exit", stop);
} catch (error) {
  console.error(error);
  stop();
  process.exitCode = 1;
}
