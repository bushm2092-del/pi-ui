interface ComposerLayoutProps {
  editor: React.ReactNode;
  addContext: React.ReactNode;
  permissions: React.ReactNode;
  reasoning: React.ReactNode;
  send: React.ReactNode;
}

export function ComposerLayout({
  editor,
  addContext,
  permissions,
  reasoning,
  send,
}: ComposerLayoutProps) {
  return (
    <div {...({"className":"min-w-0","data-codex-composer-root":""} as any)}>
      <div {...({"data-above-composer-portal":"true","data-above-composer-conversation-id":"019fc7cf-24ff-77a0-a094-966a0cd02845","className":"relative px-[var(--home-composer-inline-inset)] empty:hidden electron:grid"} as any)} />
      <div {...({"className":"relative px-[var(--home-composer-inline-inset)] empty:hidden"} as any)}>
        <div {...({"className":"order-2 flex min-w-0 flex-col empty:hidden"} as any)} />
      </div>
      <div {...({"className":"flex w-full flex-col gap-2 relative"} as any)}>
        <div {...({"className":"relative"} as any)}>
          <div {...({"className":"relative flex flex-col composer-surface-chrome bg-token-input-background/90 backdrop-blur-lg electron:dark:bg-token-dropdown-background overflow-y-auto pi-composer-surface"} as any)}>
            <div {...({"className":"relative z-10 flex min-h-0 flex-1 flex-col"} as any)}>
              <div {...({"className":"contents"} as any)}>
                <div {...({"className":"pi-composer-attachments"} as any)} />
              </div>
              <div {...({"className":"contents"} as any)}>
                <div {...({"className":"pi-composer-footer grid grid-cols-[minmax(0,auto)_auto_minmax(0,1fr)] items-center gap-x-[5px] select-none mb-2 px-2"} as any)}>
                  <div {...({"className":"min-w-0 col-start-1 row-start-2"} as any)}>
                    <div {...({"className":"flex min-w-0 items-center gap-[5px]"} as any)}>
                      <span {...({"data-state":"closed","className":"contents"} as any)}>
                        {addContext}
                      </span>
                      {permissions}
                    </div>
                  </div>
                  <div {...({"className":"min-w-0 col-span-full row-start-1 -mx-2"} as any)}>
                    <div {...({"className":"mb-1 flex-grow overflow-y-auto px-3"} as any)}>
                      <div {...({"className":"pi-composer-editor text-size-chat [&_.ProseMirror]:focus-visible:outline-none text-token-foreground h-auto max-h-[25dvh] overflow-y-auto [&_.ProseMirror]:h-auto [&_.ProseMirror]:min-h-[2rem] [&_.ProseMirror]:resize-none [&_.ProseMirror_p]:m-0 [&_.ProseMirror_ul]:ps-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ps-6 text-base [&_.ProseMirror]:leading-5"} as any)}>
                        {editor}
                      </div>
                    </div>
                  </div>
                  <div {...({"className":"min-w-0 col-start-3 row-start-2"} as any)}>
                    <div {...({"className":"flex min-w-0 items-center justify-end w-full"} as any)}>
                      <div {...({"className":"flex min-w-0 flex-1 justify-end"} as any)}>
                        <div {...({"className":"flex min-w-0 items-center gap-1"} as any)}>
                          <span>
                            <span {...({"data-state":"closed","type":"button","id":"radix-_r_l9_","aria-haspopup":"menu","aria-expanded":"false","className":"contents outline-hidden cursor-interaction"} as any)}>
                              {reasoning}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div {...({"className":"flex shrink-0 items-center gap-2"} as any)}>
                        {send}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div {...({"className":"contents"} as any)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
