// Generated from the preserved desktop markup. Keep DOM, class names, and SVG paths intact.

import type { ReactNode } from "react";

interface RootLayoutProps {
  sidebar: ReactNode;
  mainSurface: ReactNode;
}

export function RootLayout({ sidebar, mainSurface }: RootLayoutProps) {
  return (
    <>
<span {...({"className":"hidden"} as any)} />
<div {...({"className":"relative flex flex-col","style":{"--spacing-token-safe-header-left":"88px","--spacing-token-safe-header-right":"0px","width":"calc(100vw / var(--codex-window-zoom))","height":"calc(100vh / var(--codex-window-zoom))","zoom":"var(--codex-window-zoom)"}} as any)}>
      <div {...({"className":"relative isolate flex max-h-full min-h-0 w-full flex-1"} as any)}>
        {sidebar}
        {mainSurface}
      </div>
    </div>
<span {...({"className":"pointer-events-none fixed inset-0 z-[60] mx-auto my-2 flex max-w-(--composer-adjacent-max-width) flex-col items-center justify-start md:pb-5"} as any)} />
  </>
  );
}
