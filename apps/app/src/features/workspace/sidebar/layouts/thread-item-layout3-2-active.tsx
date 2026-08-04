import { LayoutSlot, type LayoutProps } from "../../layout";

export function ThreadItemLayout3_2_Active({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"className":"after:block after:h-px after:content-[''] last:after:hidden","role":"listitem","style":{"transition":"transform linear"}} as any)} {...rootProps}>
      <div {...({"className":"cursor-grab active:cursor-grabbing","role":"button","tabIndex":"0","aria-disabled":"false","aria-roledescription":"sortable","aria-describedby":"DndDescribedBy-3"} as any)}>
        <div {...({"className":"overflow-hidden","style":{"height":"auto","opacity":"1","overflow":"visible"}} as any)}>
          <div {...({"data-app-action-sidebar-thread-active":"true","data-app-action-sidebar-thread-host-id":"local","data-app-action-sidebar-thread-id":"local:019fb1b8-2419-7cd1-a415-f2ff746a8f4d","data-app-action-sidebar-thread-kind":"local","data-app-action-sidebar-thread-pinned":"false","data-app-action-sidebar-thread-row":"","data-app-action-sidebar-thread-title":"修复定时任务模型配置报错","className":"group relative cursor-interaction py-row-y text-sm hover:bg-token-list-hover-background focus-visible:outline-offset-[-2px] h-[var(--height-token-row)] sidebar-item pe-1 ps-[var(--padding-row-cell-x,var(--padding-row-x))] bg-token-list-hover-background","role":"button","tabIndex":"0","aria-label":"修复定时任务模型配置报错","data-state":"closed","aria-current":"page"} as any)}>
            <div {...({"className":"contents","data-hover-card-open-immediately":"true"} as any)}>
              <div {...({"className":"flex items-center gap-2 opacity-0 group-hover:opacity-100 [&:has(:focus-visible)]:opacity-100 absolute end-0 top-0 z-10 flex h-full items-center justify-end gap-2 pe-0.5 me-0.5 w-[52px]"} as any)}>
                <span {...({"data-state":"closed","className":"contents"} as any)}>
                  <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 !h-5 !w-5 !p-0 [&>svg]:!h-4 [&>svg]:!w-4 sidebar-hover-icon-button-tint","aria-label":"置顶聊天"} as any)}>
                    <svg {...({"width":"20","height":"20","viewBox":"0 0 20 20","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"translate-x-px"} as any)}>
                      <path {...({"d":"M11.8349 12.5C11.8349 11.7069 12.2795 11.0132 12.8613 10.5977L16.4121 8.06152L16.5019 7.98926C16.8971 7.63403 16.9472 7.02784 16.6162 6.6123L16.539 6.52637L13.4736 3.46094C13.06 3.04747 12.3913 3.07457 12.0107 3.49805L11.9384 3.58789L9.40229 7.13867C8.98671 7.72044 8.293 8.16504 7.49995 8.16504H5.41694C4.98338 8.16504 4.57411 8.46643 4.36714 8.94629C4.16208 9.4219 4.22383 9.91132 4.53901 10.2266L9.77339 15.4609L9.89936 15.5674C10.2107 15.7875 10.6375 15.8122 11.0537 15.6328C11.5335 15.4258 11.8349 15.0166 11.8349 14.583V12.5ZM13.165 14.583C13.165 15.6724 12.4217 16.4916 11.58 16.8545C10.787 17.1964 9.76258 17.1946 8.9853 16.541L8.83296 16.4014L6.6855 14.2539L2.97065 17.9707C2.71095 18.2304 2.28895 18.2304 2.02925 17.9707C1.76955 17.711 1.76955 17.289 2.02925 17.0293L5.74507 13.3135L3.59858 11.167C2.80692 10.3753 2.78076 9.26588 3.14546 8.41992C3.50834 7.57826 4.3275 6.83496 5.41694 6.83496H7.49995C7.78839 6.83496 8.10722 6.66349 8.32026 6.36523L10.8564 2.81445L10.9374 2.70703C11.8018 1.63041 13.4238 1.53039 14.414 2.52051L17.4794 5.58594L17.5722 5.68359C18.4623 6.67995 18.3348 8.2261 17.2929 9.0625L17.1855 9.14355L13.6347 11.6797C13.3365 11.8927 13.165 12.2116 13.165 12.5V14.583Z","fill":"currentColor"} as any)} />
                    </svg>
                  </button>
                </span>
                <span {...({"data-state":"closed","className":"contents"} as any)}>
                  <button {...({"type":"button","className":"no-drag cursor-interaction items-center gap-1 border whitespace-nowrap select-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 flex rounded-full electron:rounded-md enabled:hover:bg-transparent enabled:active:text-token-foreground/70 data-[state=open]:bg-transparent hover:text-token-foreground border-transparent electron:p-1 electron:[&>svg]:icon-sm flex items-center justify-center p-0.5 !h-5 !w-5 !p-0 [&>svg]:!h-4 [&>svg]:!w-4 sidebar-hover-icon-button-tint","aria-label":"归档聊天"} as any)}>
                    <svg {...({"width":"20","height":"20","viewBox":"0 0 20 20","fill":"none","xmlns":"http://www.w3.org/2000/svg"} as any)}>
                      <path {...({"d":"M11.8008 10.1816C12.1035 10.2438 12.3309 10.5119 12.3311 10.833C12.3311 11.1542 12.1036 11.4222 11.8008 11.4844L11.666 11.498H8.33301C7.96589 11.4979 7.66797 11.2002 7.66797 10.833C7.66814 10.466 7.966 10.1682 8.33301 10.168H11.666L11.8008 10.1816Z","fill":"currentColor"} as any)} />
                      <path {...({"fillRule":"evenodd","clipRule":"evenodd","d":"M15.417 2.66797C16.7045 2.66815 17.7489 3.71251 17.749 5V5.83301C17.749 6.33171 17.59 6.79271 17.3232 7.17188C17.3263 7.19763 17.3311 7.22343 17.3311 7.25V12.667C17.3311 13.3559 17.3317 13.9131 17.2949 14.3633C17.2622 14.7639 17.197 15.1246 17.0527 15.4609L16.9863 15.6035C16.7209 16.1245 16.3169 16.5602 15.8213 16.8643L15.6035 16.9863C15.2268 17.1782 14.8202 17.2575 14.3623 17.2949C13.9121 17.3317 13.3549 17.332 12.666 17.332H7.33301C6.64407 17.332 6.08689 17.3317 5.63672 17.2949C5.23627 17.2622 4.87521 17.1979 4.53906 17.0537L4.39648 16.9863C3.8754 16.7208 3.43882 16.3171 3.13477 15.8213L3.0127 15.6035C2.82089 15.227 2.74153 14.821 2.7041 14.3633C2.66732 13.9131 2.66797 13.3559 2.66797 12.667V7.25C2.66797 7.22312 2.67268 7.19694 2.67578 7.1709C2.4096 6.79197 2.25195 6.33115 2.25195 5.83301V5C2.25212 3.7124 3.29634 2.66797 4.58398 2.66797H15.417ZM16.001 8.08789C15.8141 8.13621 15.619 8.16501 15.417 8.16504H4.58398C4.38146 8.16504 4.18541 8.13644 3.99805 8.08789V12.667C3.99805 13.3778 3.99895 13.8714 4.03027 14.2549C4.06097 14.6303 4.11779 14.8421 4.19824 15L4.26855 15.126C4.44482 15.4134 4.69792 15.6478 5 15.8018L5.12988 15.8574C5.27361 15.9089 5.4633 15.9467 5.74512 15.9697C6.12858 16.0011 6.62215 16.002 7.33301 16.002H12.666C13.3767 16.002 13.8705 16.001 14.2539 15.9697C14.6292 15.9391 14.8411 15.8821 14.999 15.8018L15.126 15.7305C15.4132 15.5542 15.6479 15.3019 15.8018 15L15.8574 14.8691C15.9088 14.7255 15.9467 14.5363 15.9697 14.2549C16.0011 13.8714 16.001 13.3779 16.001 12.667V8.08789ZM4.58398 3.99805C4.03088 3.99805 3.5822 4.44693 3.58203 5V5.83301C3.58203 6.38621 4.03078 6.83496 4.58398 6.83496H15.417C15.97 6.83478 16.4189 6.3861 16.4189 5.83301V5C16.4188 4.44705 15.9699 3.99823 15.417 3.99805H4.58398Z","fill":"currentColor"} as any)} />
                    </svg>
                  </button>
                </span>
              </div>
            </div>
            <div {...({"data-hover-card-open-immediately":"true","className":"flex shrink-0 items-center justify-end absolute end-0 top-0 z-10 flex h-full min-w-[52px] items-center justify-end gap-2 pe-1 group-hover:hidden group-has-[:focus-visible]:hidden"} as any)}>
              <span {...({"className":"flex h-5 min-w-5 items-center justify-center"} as any)}>
                <div {...({"className":"relative flex size-5 shrink-0 items-center justify-center text-token-description-foreground"} as any)}>
                  <span {...({"className":"icon-xs relative scale-50"} as any)}>
                    <span {...({"className":"absolute inset-0 rounded-full","style":{"backgroundColor":"var(--vscode-textLink-foreground)"}} as any)} />
                  </span>
                </div>
              </span>
            </div>
            <div {...({"className":"flex h-full w-full items-center text-sm leading-4"} as any)}>
              <div {...({"className":"flex min-w-0 flex-1 items-center gap-2"} as any)}>
                <div {...({"className":"flex w-4 shrink-0 items-center justify-center"} as any)}>
                  <div {...({"className":"relative flex items-center justify-center"} as any)} />
                </div>
                <div {...({"className":"flex min-w-0 flex-1 self-stretch text-base leading-5 items-center gap-2 text-token-foreground","data-thread-title-trigger":"true"} as any)}>
                  <span {...({"data-thread-title":"true","id":"_r_gh_","className":"_viewport_1ozkg_1 _animateOnGroupHover_1ozkg_53 min-w-0 select-none flex-1","data-marquee-text":"true","draggable":"false","data-marquee-overflowing":"true","data-marquee-animatable":"true"} as any)}>
                    <span {...({"className":"_clipViewport_1ozkg_13 _overflowingViewport_1ozkg_33"} as any)}>
                      <span {...({"className":"_track_1ozkg_21 _scrolling_1ozkg_52","style":{"--marquee-cycle-duration":"8.775s","--marquee-scroll-distance":"184.09375px","--marquee-scroll-timing":"linear(0.0000 0.0000%, 0.0000 3.9887%, 0.0140 4.8454%, 0.0280 5.6945%, 0.0419 6.5360%, 0.0557 7.3701%, 0.0694 8.1968%, 0.0830 9.0163%, 0.0966 9.8285%, 0.1101 10.6336%, 0.1235 11.4317%, 0.1369 12.2228%, 0.1501 13.0070%, 0.1633 13.7844%, 0.1764 14.5551%, 0.1894 15.3191%, 0.2024 16.0765%, 0.2152 16.8275%, 0.2280 17.5720%, 0.2407 18.3102%, 0.2533 19.0421%, 0.2658 19.7679%, 0.2783 20.4876%, 0.2906 21.2012%, 0.3029 21.9089%, 0.3151 22.6108%, 0.3272 23.3069%, 0.3392 23.9973%, 0.3511 24.6820%, 0.3629 25.3612%, 0.3747 26.0350%, 0.3863 26.7033%, 0.3979 27.3664%, 0.4094 28.0242%, 0.4208 28.6769%, 0.4320 29.3246%, 0.4432 29.9672%, 0.4543 30.6050%, 0.4653 31.2379%, 0.4763 31.8660%, 0.4871 32.4895%, 0.4978 33.1084%, 0.5084 33.7228%, 0.5190 34.3328%, 0.5294 34.9384%, 0.5397 35.5397%, 0.5500 36.1369%, 0.5601 36.7299%, 0.5701 37.3189%, 0.5801 37.9039%, 0.5899 38.4851%, 0.5997 39.0625%, 0.6093 39.6361%, 0.6188 40.2061%, 0.6282 40.7726%, 0.6376 41.3356%, 0.6468 41.8951%, 0.6559 42.4514%, 0.6649 43.0044%, 0.6738 43.5543%, 0.6826 44.1010%, 0.6913 44.6448%, 0.6999 45.1856%, 0.7084 45.7236%, 0.7167 46.2589%, 0.7250 46.7914%, 0.7331 47.3213%, 0.7412 47.8488%, 0.7491 48.3737%, 0.7569 48.8963%, 0.7646 49.4166%, 0.7722 49.9347%, 0.7797 50.4507%, 0.7871 50.9646%, 0.7943 51.4765%, 0.8014 51.9866%, 0.8085 52.4948%, 0.8154 53.0013%, 0.8221 53.5062%, 0.8288 54.0094%, 0.8354 54.5112%, 0.8418 55.0115%, 0.8481 55.5106%, 0.8543 56.0083%, 0.8604 56.5049%, 0.8663 57.0004%, 0.8722 57.4948%, 0.8779 57.9884%, 0.8835 58.4810%, 0.8889 58.9729%, 0.8943 59.4641%, 0.8995 59.9546%, 0.9046 60.4446%, 0.9095 60.9342%, 0.9144 61.4233%, 0.9191 61.9122%, 0.9237 62.4008%, 0.9281 62.8892%, 0.9325 63.3776%, 0.9367 63.8661%, 0.9407 64.3546%, 0.9447 64.8432%, 0.9485 65.3322%, 0.9522 65.8214%, 0.9557 66.3111%, 0.9591 66.8012%, 0.9624 67.2919%, 0.9656 67.7833%, 0.9686 68.2753%, 0.9715 68.7682%, 0.9742 69.2620%, 0.9768 69.7567%, 0.9793 70.2525%, 0.9816 70.7494%, 0.9838 71.2475%, 0.9859 71.7468%, 0.9878 72.2476%, 0.9896 72.7497%, 0.9913 73.2534%, 0.9928 73.7587%, 0.9941 74.2657%, 0.9954 74.7744%, 0.9964 75.2849%, 0.9974 75.7974%, 0.9982 76.3119%, 0.9988 76.8284%, 0.9993 77.3471%, 0.9997 77.8680%, 0.9999 78.3912%, 1.0000 78.9168%, 1.0000 100.0000%)"}} as any)}>
                        <span {...({"className":"_content_1ozkg_28","data-marquee-content":"true"} as any)}>
                          <LayoutSlot name="sidebar-thread-label" slots={slots} />
                        </span>
                        <span {...({"className":"_content_1ozkg_28","aria-hidden":"true","data-marquee-copy":"true"} as any)}>
                          <LayoutSlot name="sidebar-thread-label" slots={slots} />
                        </span>
                      </span>
                    </span>
                  </span>
                </div>
              </div>
              <div {...({"className":"ms-[3px] flex items-center justify-end gap-1 group-hover:min-w-12 group-has-[:focus-visible]:min-w-12"} as any)} />
              <div {...({"className":"shrink-0 group-hover:hidden group-has-[:focus-visible]:hidden","style":{"width":"24px"}} as any)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
