export interface A2uiComponent {
  id: string;
  component: string;
  [key: string]: unknown;
}

export interface A2uiSurface {
  id: string;
  catalogId?: string;
  components: Map<string, A2uiComponent>;
  dataModel: unknown;
  deleted: boolean;
}

export interface A2uiDocument {
  surfaces: A2uiSurface[];
  errors: string[];
}

export function parseA2uiJsonl(source: string): A2uiDocument {
  const messages: unknown[] = [];
  const errors: string[] = [];
  for (const [index, line] of source.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    try { messages.push(JSON.parse(line)); } catch { errors.push(`第 ${index + 1} 行不是有效 JSON`); }
  }
  const document = parseA2uiMessages(messages);
  return { surfaces: document.surfaces, errors: [...errors, ...document.errors] };
}

export function parseA2uiMessages(input: unknown[]): A2uiDocument {
  const surfaces = new Map<string, A2uiSurface>();
  const errors: string[] = [];
  for (const [index, message] of input.entries()) {
    if (!isRecord(message) || (message.version !== "v0.9" && message.version !== "v0.9.1")) {
      errors.push(`第 ${index + 1} 行不是 A2UI v0.9 消息`);
      continue;
    }
    applyMessage(message, surfaces, errors, index + 1);
  }

  return { surfaces: [...surfaces.values()].filter((surface) => !surface.deleted), errors };
}

function applyMessage(
  message: Record<string, unknown>,
  surfaces: Map<string, A2uiSurface>,
  errors: string[],
  line: number,
): void {
  if (isRecord(message.createSurface)) {
    const id = readString(message.createSurface.surfaceId);
    if (!id) {
      errors.push(`第 ${line} 行缺少 surfaceId`);
      return;
    }
    const surface = getSurface(surfaces, id);
    surface.catalogId = readString(message.createSurface.catalogId);
    surface.deleted = false;
    return;
  }
  if (isRecord(message.updateComponents)) {
    const id = readString(message.updateComponents.surfaceId);
    const components = message.updateComponents.components;
    if (!id || !Array.isArray(components)) {
      errors.push(`第 ${line} 行的 updateComponents 无效`);
      return;
    }
    const surface = getSurface(surfaces, id);
    for (const value of components) {
      const component = normalizeComponent(value);
      if (component) surface.components.set(component.id, component);
    }
    return;
  }
  if (isRecord(message.updateDataModel)) {
    const id = readString(message.updateDataModel.surfaceId);
    if (!id) {
      errors.push(`第 ${line} 行的 updateDataModel 缺少 surfaceId`);
      return;
    }
    const surface = getSurface(surfaces, id);
    surface.dataModel = setJsonPointer(
      surface.dataModel,
      readString(message.updateDataModel.path) ?? "/",
      message.updateDataModel.value,
    );
    return;
  }
  if (isRecord(message.deleteSurface)) {
    const id = readString(message.deleteSurface.surfaceId);
    if (id) getSurface(surfaces, id).deleted = true;
    return;
  }
  errors.push(`第 ${line} 行包含不支持的 A2UI 消息`);
}

function normalizeComponent(value: unknown): A2uiComponent | undefined {
  if (!isRecord(value)) return undefined;
  const id = readString(value.id);
  if (!id) return undefined;
  if (typeof value.component === "string") return { ...value, id, component: value.component } as A2uiComponent;
  if (!isRecord(value.component)) return undefined;
  const entries = Object.entries(value.component);
  if (entries.length !== 1) return undefined;
  const [component, properties] = entries[0]!;
  if (!isRecord(properties)) return undefined;
  return { id, component, ...properties };
}

function getSurface(surfaces: Map<string, A2uiSurface>, id: string): A2uiSurface {
  const current = surfaces.get(id);
  if (current) return current;
  const surface: A2uiSurface = { id, components: new Map(), dataModel: {}, deleted: false };
  surfaces.set(id, surface);
  return surface;
}

export function resolveJsonPointer(value: unknown, pointer: string): unknown {
  if (pointer === "" || pointer === "/") return value;
  return pointer.split("/").slice(1).reduce<unknown>((current, segment) => {
    if (!isRecord(current) && !Array.isArray(current)) return undefined;
    const key = segment.replaceAll("~1", "/").replaceAll("~0", "~");
    return (current as Record<string, unknown>)[key];
  }, value);
}

function setJsonPointer(root: unknown, pointer: string, value: unknown): unknown {
  if (pointer === "" || pointer === "/") return value;
  const next = isRecord(root) ? structuredClone(root) : {};
  const parts = pointer.split("/").slice(1).map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"));
  let target: Record<string, unknown> = next;
  for (const part of parts.slice(0, -1)) {
    const child = isRecord(target[part]) ? target[part] : {};
    target[part] = child;
    target = child;
  }
  const last = parts.at(-1);
  if (last) target[last] = value;
  return next;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
