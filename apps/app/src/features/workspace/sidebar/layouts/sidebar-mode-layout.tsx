import { LayoutSlot, type LayoutProps } from "../../layout";

export function SidebarModeLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"className":"ms-2 flex items-center pe-1"} as any)} {...rootProps}>
      <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full text-token-foreground enabled:hover:bg-token-list-hover-background enabled:active:bg-token-foreground/15 data-[state=open]:bg-token-list-hover-background border-transparent px-2 py-0.5 text-sm leading-[18px] min-w-0 outline-hidden cursor-interaction -ms-2 h-8 min-w-0 rounded-xl px-2 !text-[17px] !leading-6 font-medium","aria-label":"切换模式，当前模式：PI-Codex :UI","id":"radix-_r_eu_","aria-haspopup":"menu","aria-expanded":"false","data-state":"closed"} as any)}>
        <LayoutSlot name="sidebar-mode-label" slots={slots} />
        <svg {...({"width":"20","height":"21","viewBox":"0 0 20 21","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon-2xs shrink-0 text-token-input-placeholder-foreground"} as any)}>
          <path {...({"d":"M15.2793 7.71101C15.539 7.45131 15.961 7.45131 16.2207 7.71101C16.4804 7.97071 16.4804 8.39272 16.2207 8.65242L10.4707 14.4024C10.211 14.6621 9.78902 14.6621 9.52932 14.4024L3.77932 8.65242L3.69436 8.54792C3.52385 8.28979 3.55205 7.93828 3.77932 7.71101C4.00659 7.48374 4.3581 7.45554 4.61623 7.62605L4.72073 7.71101L10 12.9903L15.2793 7.71101Z","fill":"currentColor","stroke":"currentColor","strokeWidth":"0.6"} as any)} />
        </svg>
      </button>
      <div {...({"className":"ms-auto flex items-center gap-1"} as any)}>
        <span {...({"data-state":"closed","className":"contents"} as any)}>
          <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md text-token-text-tertiary enabled:hover:bg-token-list-hover-background enabled:active:bg-token-foreground/15 data-[state=open]:bg-token-list-hover-background border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 ms-auto translate-x-0.5","aria-label":"搜索"} as any)}>
            <svg {...({"width":"16","height":"16","viewBox":"0 0 16 16","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon-xs"} as any)}>
              <path {...({"fillRule":"evenodd","clipRule":"evenodd","d":"M7.33057 1.98535C10.2484 1.98535 12.6136 4.3508 12.6138 7.26855C12.6138 8.58031 12.1346 9.77942 11.3433 10.7031L13.9897 13.3496C14.1655 13.5253 14.1655 13.8106 13.9897 13.9863C13.814 14.1621 13.5288 14.1621 13.353 13.9863L10.7017 11.335C9.78678 12.0942 8.61243 12.5518 7.33057 12.5518C4.41281 12.5516 2.04736 10.1864 2.04736 7.26855C2.04754 4.35091 4.41292 1.98553 7.33057 1.98535ZM7.33057 2.88574C4.90998 2.88592 2.94793 4.84796 2.94775 7.26855C2.94775 9.68929 4.90987 11.6522 7.33057 11.6523C9.75141 11.6523 11.7144 9.6894 11.7144 7.26855C11.7142 4.84786 9.75131 2.88574 7.33057 2.88574Z","fill":"currentColor"} as any)} />
            </svg>
          </button>
        </span>
        <div>
          <span {...({"data-state":"closed","className":"contents"} as any)}>
            <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md text-token-text-tertiary enabled:hover:bg-token-list-hover-background enabled:active:bg-token-foreground/15 data-[state=open]:bg-token-list-hover-background border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5","aria-label":"优先级，需要关注","aria-pressed":"false"} as any)}>
              <svg {...({"width":"20","height":"20","viewBox":"0 0 20 20","fill":"none","xmlns":"http://www.w3.org/2000/svg","aria-hidden":"true","className":"icon-xs"} as any)}>
                <path {...({"fillRule":"evenodd","clipRule":"evenodd","d":"M10.1924 1.62857C10.5595 1.63761 10.8499 1.94306 10.8408 2.31021C10.8318 2.67735 10.5263 2.96768 10.1592 2.95865C10.1067 2.95736 10.0535 2.9567 10 2.9567C8.50663 2.95673 7.36381 3.46274 6.57814 4.24966C5.78759 5.04163 5.316 6.16189 5.25099 7.45767L5.09669 10.5075C5.07992 10.839 4.992 11.1636 4.83986 11.4586L3.80958 13.4577C3.74517 13.5826 3.76889 13.6623 3.77345 13.6715L3.7754 13.6735C3.7754 13.6735 3.77926 13.6762 3.78322 13.6784C3.79744 13.6863 3.84926 13.7096 3.96388 13.7096H16.0371C16.1518 13.7096 16.2037 13.6862 16.2178 13.6784C16.2215 13.6763 16.2246 13.6735 16.2246 13.6735L16.2266 13.6725L16.2276 13.6715C16.2321 13.6624 16.2557 13.5825 16.1914 13.4577L15.1602 11.4586C15.008 11.1636 14.9201 10.839 14.9033 10.5075V9.58072C14.9033 9.21346 15.2011 8.91569 15.5684 8.91568C15.9354 8.91592 16.2334 9.2136 16.2334 9.58072V10.4489C16.2417 10.5882 16.2779 10.7243 16.3418 10.8483L17.3721 12.8473C17.5861 13.2621 17.6503 13.7943 17.419 14.2614C17.1674 14.7691 16.6502 15.0396 16.0371 15.0397H13.9434C13.6266 16.9314 11.9817 18.3727 10 18.3727C8.01845 18.3725 6.37423 16.9313 6.05763 15.0397H3.96388C3.35063 15.0397 2.83259 14.7693 2.58107 14.2614C2.34977 13.7943 2.41301 13.2621 2.62697 12.8473L3.65822 10.8483C3.72348 10.7216 3.76138 10.5825 3.76857 10.4401L3.92189 7.39029C4.00121 5.81129 4.58404 4.36557 5.63771 3.31021C6.69649 2.24974 8.18842 1.62665 10 1.62662C10.0645 1.62662 10.1287 1.627 10.1924 1.62857ZM7.41896 15.0397C7.71461 16.1911 8.75629 17.0425 10 17.0426C11.2439 17.0426 12.2862 16.1912 12.582 15.0397H7.41896Z","fill":"currentColor"} as any)} />
                <path {...({"d":"M14.1562 6.63542C14.6701 6.93403 15.2292 7.08333 15.8333 7.08333C16.4375 7.08333 16.9931 6.93403 17.5 6.63542C18.0139 6.33681 18.4201 5.93403 18.7187 5.42708C19.0174 4.91319 19.1667 4.35417 19.1667 3.75C19.1667 3.14583 19.0174 2.59028 18.7187 2.08333C18.4201 1.56944 18.0139 1.16319 17.5 0.864583C16.9931 0.565972 16.4375 0.416667 15.8333 0.416667C15.2292 0.416667 14.6701 0.565972 14.1562 0.864583C13.6493 1.16319 13.2465 1.56944 12.9479 2.08333C12.6493 2.59028 12.5 3.14583 12.5 3.75C12.5 4.35417 12.6493 4.91319 12.9479 5.42708C13.2465 5.93403 13.6493 6.33681 14.1562 6.63542Z","fill":"var(--color-token-text-link-foreground)"} as any)} />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
