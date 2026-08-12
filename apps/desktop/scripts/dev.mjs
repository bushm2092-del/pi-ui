import { spawn } from "node:child_process";

const workspaceRoot = new URL("../../..", import.meta.url).pathname;
const appUrl = "http://127.0.0.1:5173";
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

async function waitForVite() {
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
  vite = run("pnpm", ["--filter", "@pi/app", "dev"]);
  await waitForVite();
  electron = run("pnpm", ["exec", "electron", "."], { env: { ...process.env, PI_APP_URL: appUrl } });
  electron.once("exit", stop);
} catch (error) {
  console.error(error);
  stop();
  process.exitCode = 1;
}
