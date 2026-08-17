## 样式规范

- 优先使用 Tailwind CSS 工具类（utility classes）。
- 正常情况下不要新建 `.css` 文件；仅保留必要的全局主题与第三方样式（集中在 `styles/` 下）。
- 组件样式通过 className 组合实现；用 `cn()`（clsx + tailwind-merge）合并类名。

## 测试规范

- 测试文件统一放在 `__test__/` 目录下，不要与源文件同目录混放。
- 命名：`*.test.ts` / `*.test.tsx`。
- 运行：`pnpm test`（或 `pnpm --filter @pi/app test`、`pnpm --filter @pi/server test`）。
