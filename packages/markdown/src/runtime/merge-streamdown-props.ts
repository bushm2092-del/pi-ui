import type {
  ControlsConfig,
  PluginConfig,
  StreamdownProps,
} from "streamdown";

function mergeControls(
  defaults: ControlsConfig | undefined,
  overrides: ControlsConfig | undefined,
): ControlsConfig | undefined {
  if (overrides === undefined) return defaults;
  if (typeof overrides === "boolean" || typeof defaults !== "object") {
    return overrides;
  }

  return {
    ...defaults,
    ...overrides,
    code:
      typeof defaults.code === "object" && typeof overrides.code === "object"
        ? { ...defaults.code, ...overrides.code }
        : overrides.code ?? defaults.code,
    mermaid:
      typeof defaults.mermaid === "object" &&
      typeof overrides.mermaid === "object"
        ? { ...defaults.mermaid, ...overrides.mermaid }
        : overrides.mermaid ?? defaults.mermaid,
    table:
      typeof defaults.table === "object" && typeof overrides.table === "object"
        ? { ...defaults.table, ...overrides.table }
        : overrides.table ?? defaults.table,
  };
}

function mergePlugins(
  defaults: PluginConfig | undefined,
  overrides: PluginConfig | undefined,
): PluginConfig | undefined {
  if (!defaults) return overrides;
  if (!overrides) return defaults;
  return { ...defaults, ...overrides };
}

export function mergeStreamdownProps(
  defaults: StreamdownProps,
  overrides: StreamdownProps,
): StreamdownProps {
  return {
    ...defaults,
    ...overrides,
    components: {
      ...defaults.components,
      ...overrides.components,
    },
    allowedTags: {
      ...defaults.allowedTags,
      ...overrides.allowedTags,
    },
    controls: mergeControls(defaults.controls, overrides.controls),
    icons: { ...defaults.icons, ...overrides.icons },
    plugins: mergePlugins(defaults.plugins, overrides.plugins),
    translations: { ...defaults.translations, ...overrides.translations },
  };
}
