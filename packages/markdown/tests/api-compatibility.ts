import {
  Block,
  CodeBlock,
  StreamingMarkdown,
  StaticMarkdown,
  Streamdown,
  TableCopyDropdown,
  createAnimatePlugin,
  defaultRehypePlugins,
  defaultRemarkPlugins,
  defaultUrlTransform,
  extractTableDataFromElement,
  parseMarkdownIntoBlocks,
  tableDataToCSV,
  tableDataToMarkdown,
  tableDataToTSV,
  useIsCodeFenceIncomplete,
} from "../src";
import type {
  Components,
  PluginConfig,
  StreamdownProps,
  StreamdownTranslations,
} from "../src";

void [
  Block,
  CodeBlock,
  StreamingMarkdown,
  StaticMarkdown,
  Streamdown,
  TableCopyDropdown,
  createAnimatePlugin,
  defaultRehypePlugins,
  defaultRemarkPlugins,
  defaultUrlTransform,
  extractTableDataFromElement,
  parseMarkdownIntoBlocks,
  tableDataToCSV,
  tableDataToMarkdown,
  tableDataToTSV,
  useIsCodeFenceIncomplete,
];

type PublicTypes = [
  Components,
  PluginConfig,
  StreamdownProps,
  StreamdownTranslations,
];

export type { PublicTypes };
