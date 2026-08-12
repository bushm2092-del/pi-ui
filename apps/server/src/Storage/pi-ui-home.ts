import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

const CONFIG_VERSION = 1;

export interface PiUiHome {
  root: string;
  databaseDir: string;
  databaseFile: string;
  sessionsDir: string;
  logsDir: string;
  cacheDir: string;
  configFile: string;
}

export function resolvePiUiHome(root = join(homedir(), ".pi-ui")): PiUiHome {
  const resolvedRoot = resolve(root);

  return {
    root: resolvedRoot,
    databaseDir: join(resolvedRoot, "Database"),
    databaseFile: join(resolvedRoot, "Database", "pi-ui.sqlite"),
    sessionsDir: join(resolvedRoot, "Sessions"),
    logsDir: join(resolvedRoot, "Logs"),
    cacheDir: join(resolvedRoot, "Cache"),
    configFile: join(resolvedRoot, "config.json"),
  };
}

export async function initializePiUiHome(root?: string): Promise<PiUiHome> {
  const paths = resolvePiUiHome(root);

  await Promise.all([
    mkdir(paths.databaseDir, { recursive: true }),
    mkdir(paths.sessionsDir, { recursive: true }),
    mkdir(paths.logsDir, { recursive: true }),
    mkdir(paths.cacheDir, { recursive: true }),
  ]);

  await writeBuiltInFile(paths.configFile, {
    version: CONFIG_VERSION,
    database: "Database/pi-ui.sqlite",
    sessions: "Sessions",
    logs: "Logs",
    cache: "Cache",
  });

  return paths;
}

async function writeBuiltInFile(path: string, value: unknown): Promise<void> {
  try {
    await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  } catch (error) {
    if (!isAlreadyExistsError(error)) throw error;
  }
}

function isAlreadyExistsError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "EEXIST";
}
