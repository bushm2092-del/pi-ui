import type { MouseEvent } from "react";
import ArchiveIcon from "../../../../../../assets/svg/archive.svg?react";
import PinIcon from "../../../../../../assets/svg/pin.svg?react";
import type { ThreadItem } from "../../../../data/workspace-data";
import { useTranslation } from "react-i18next";

const actionButtonClass = "no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 !h-5 !w-5 !p-0 [&>svg]:!h-4 [&>svg]:!w-4 sidebar-hover-icon-button-tint sidebar-thread-action-button";

export function ThreadItemLayout({
  thread,
  active,
  onSelect,
  pinned = false,
  onPin = () => undefined,
  onArchive = () => undefined,
}: {
  thread: ThreadItem;
  active: boolean;
  onSelect: () => void;
  pinned?: boolean;
  onPin?: () => void;
  onArchive?: () => void;
}) {
  const { t } = useTranslation();
  if (thread.kind === "show-more") {
    return (
      <div className="flex gap-1 py-1 px-8 after:block after:h-px after:content-[''] last:after:hidden" role="listitem">
        <button type="button" className="no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent px-2 py-0.5 text-sm leading-[18px] !text-base !text-token-input-placeholder-foreground !opacity-75 hover:!text-token-foreground -ms-[9px]">
          {thread.label}
        </button>
      </div>
    );
  }

  const stopPropagation = (event: MouseEvent) => event.stopPropagation();

  return (
    <div className="after:block after:h-px after:content-[''] last:after:hidden" role="listitem" style={{ transition: "transform linear" }}>
      <div className="cursor-grab active:cursor-grabbing" role="button" tabIndex={0} aria-disabled="false" aria-roledescription="sortable">
        <div className="overflow-hidden" style={{ height: "auto", opacity: 1, overflow: "visible" }}>
          <div
            data-app-action-sidebar-thread-active={String(active)}
            data-app-action-sidebar-thread-host-id="local"
            data-app-action-sidebar-thread-id={thread.id}
            data-app-action-sidebar-thread-kind="local"
            data-app-action-sidebar-thread-pinned={String(pinned)}
            data-app-action-sidebar-thread-row=""
            data-app-action-sidebar-thread-title={thread.label}
            className={`group relative cursor-interaction py-row-y text-sm hover:bg-token-list-hover-background focus-visible:outline-offset-[-2px] h-[var(--height-token-row)] sidebar-item pe-1 ps-[var(--padding-row-cell-x,var(--padding-row-x))]${active ? " bg-token-list-hover-background" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={thread.label}
            aria-current={active ? "page" : undefined}
            data-state="closed"
            onClick={onSelect}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect();
              }
            }}
          >
            <div className="contents" data-hover-card-open-immediately="true">
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 [&:has(:focus-visible)]:opacity-100 absolute end-0 top-0 z-10 h-full justify-end pe-0.5 me-0.5 w-[52px]">
                <span data-state="closed" className="contents">
                  <button type="button" className={actionButtonClass} aria-label={pinned ? t("sidebar.actions.unpinConversation") : t("sidebar.actions.pinConversation")} onClick={(event) => { stopPropagation(event); onPin(); }}>
                    <PinIcon className="translate-x-px" aria-hidden="true" />
                  </button>
                </span>
                <span data-state="closed" className="contents">
                  <button type="button" className={actionButtonClass} aria-label={t("sidebar.actions.archiveConversation")} onClick={(event) => { stopPropagation(event); onArchive(); }}>
                    <ArchiveIcon aria-hidden="true" />
                  </button>
                </span>
              </div>
            </div>
            {thread.indicator ? <ThreadIndicator indicator={thread.indicator} /> : null}
            <div className="flex h-full w-full items-center text-sm leading-4">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="flex w-4 shrink-0 items-center justify-center">
                  <div className="relative flex items-center justify-center" />
                </div>
                <div className="flex min-w-0 flex-1 self-stretch text-base leading-5 items-center gap-2 text-token-foreground" data-thread-title-trigger="true">
                  <span data-thread-title="true" className="min-w-0 select-none flex-1 truncate" draggable="false">
                    {thread.label}
                  </span>
                </div>
              </div>
              <div className="ms-[3px] flex items-center justify-end gap-1 group-hover:min-w-12 group-has-[:focus-visible]:min-w-12" />
              {thread.indicator ? <div className="shrink-0 group-hover:hidden group-has-[:focus-visible]:hidden" style={{ width: 24 }} /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreadIndicator({ indicator }: { indicator: "running" | "unread" }) {
  return (
    <div data-hover-card-open-immediately="true" className="flex shrink-0 items-center justify-end absolute end-0 top-0 z-10 h-full min-w-[52px] gap-2 pe-1 group-hover:hidden group-has-[:focus-visible]:hidden">
      <span className="flex h-5 min-w-5 items-center justify-center">
        <div className={`relative flex size-5 shrink-0 items-center justify-center ${indicator === "running" ? "text-token-foreground/70" : "text-token-description-foreground"}`}>
          {indicator === "running" ? (
            <div className="animate-spin inline-flex h-fit w-fit items-center justify-center leading-none contain-layout contain-paint contain-style" style={{ animationDelay: "-338ms", animationDuration: "2000ms" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-xs shrink-0">
                <path opacity="0.3" d="M18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12ZM20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" fill="currentColor" />
                <path d="M12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12H6C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6V4Z" fill="currentColor" />
              </svg>
            </div>
          ) : (
            <span className="icon-xs relative scale-50">
              <span className="absolute inset-0 rounded-full" style={{ backgroundColor: "var(--vscode-textLink-foreground)" }} />
            </span>
          )}
        </div>
      </span>
    </div>
  );
}
