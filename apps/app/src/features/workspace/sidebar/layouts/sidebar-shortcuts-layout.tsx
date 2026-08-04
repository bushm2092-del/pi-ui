import { LayoutSlot, type LayoutProps } from "../../layout";

export function SidebarShortcutsLayout({ slots = {}, rootProps = {} }: LayoutProps = {}) {
  return (
    <div {...({"className":"flex shrink-0 flex-col gap-2"} as any)} {...rootProps}>
      <div {...({"className":"shrink-0 px-row-x"} as any)}>
        <div {...({"className":"flex flex-col gap-1"} as any)}>
          <div {...({"className":"flex flex-col gap-px"} as any)}>
            <button {...({"type":"button","className":"sidebar-item focus-visible:outline-token-border relative h-[var(--height-token-row)] px-[var(--padding-row-cell-x,var(--padding-row-x))] py-row-y cursor-interaction shrink-0 items-center overflow-hidden text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 gap-2 flex w-full hover:bg-token-list-hover-background"} as any)}>
              <div {...({"className":"flex min-w-0 items-center text-base gap-2 flex-1 text-token-foreground"} as any)}>
                <span {...({"className":"flex w-4 shrink-0 items-center justify-center"} as any)}>
                  <svg {...({"width":"21","height":"21","viewBox":"0 0 21 21","fill":"currentColor","xmlns":"http://www.w3.org/2000/svg","className":"icon-xs"} as any)}>
                    <path {...({"d":"M6.12695 15.4998C6.12695 14.8315 5.58526 14.2898 4.91699 14.2898C4.24873 14.2898 3.70703 14.8315 3.70703 15.4998C3.70703 16.168 4.24873 16.7097 4.91699 16.7097C5.58526 16.7097 6.12695 16.168 6.12695 15.4998ZM16.96 5.49976C16.96 4.83149 16.4183 4.28979 15.75 4.28979C15.0819 4.28997 14.54 4.8316 14.54 5.49976C14.54 6.16791 15.0819 6.70954 15.75 6.70972C16.4183 6.70972 16.96 6.16802 16.96 5.49976ZM7.45703 15.4998C7.45703 16.9026 6.3198 18.0398 4.91699 18.0398C3.51419 18.0398 2.37695 16.9026 2.37695 15.4998C2.37695 14.3273 3.17207 13.3431 4.25195 13.0505V7.16675C4.25195 5.879 5.29624 4.83472 6.58398 4.83472H8.72754L8.19629 4.30347L8.11133 4.19897C7.94107 3.94099 7.96939 3.59025 8.19629 3.36304C8.42365 3.13568 8.77504 3.10735 9.0332 3.27808L9.1377 3.36304L10.8037 5.02905C11.0634 5.28875 11.0634 5.71076 10.8037 5.97046L9.1377 7.63647L9.0332 7.72144C8.77504 7.89216 8.42365 7.86383 8.19629 7.63647C7.93697 7.3768 7.93686 6.95565 8.19629 6.69604L8.72754 6.16479H6.58398C6.03078 6.16479 5.58203 6.61354 5.58203 7.16675V13.0505C6.66191 13.3431 7.45703 14.3273 7.45703 15.4998ZM18.29 5.49976C18.29 6.67221 17.4949 7.6555 16.415 7.948V13.8328C16.415 15.1204 15.3716 16.1646 14.084 16.1648H11.9395L12.4707 16.696L12.5557 16.8005C12.7261 17.0586 12.6978 17.4092 12.4707 17.6365C12.2435 17.8637 11.8929 17.8918 11.6348 17.7214L11.5303 17.6365L9.86328 15.9705C9.73857 15.8457 9.66895 15.6761 9.66895 15.4998C9.66895 15.3234 9.73857 15.1538 9.86328 15.0291L11.5303 13.363C11.79 13.1033 12.211 13.1033 12.4707 13.363C12.7302 13.6227 12.7303 14.0438 12.4707 14.3035L11.9395 14.8347H14.084C14.637 14.8345 15.085 14.3859 15.085 13.8328V7.948C14.0054 7.65529 13.21 6.67199 13.21 5.49976C13.21 4.09706 14.3473 2.95989 15.75 2.95972C17.1528 2.95972 18.29 4.09695 18.29 5.49976Z"} as any)} />
                  </svg>
                </span>
                <LayoutSlot name="sidebar-shortcut-label-0" slots={slots} />
              </div>
            </button>
            <button {...({"type":"button","className":"sidebar-item focus-visible:outline-token-border relative h-[var(--height-token-row)] px-[var(--padding-row-cell-x,var(--padding-row-x))] py-row-y cursor-interaction shrink-0 items-center overflow-hidden text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 gap-2 flex w-full hover:bg-token-list-hover-background"} as any)}>
              <div {...({"className":"flex min-w-0 items-center text-base gap-2 flex-1 text-token-foreground"} as any)}>
                <span {...({"className":"flex w-4 shrink-0 items-center justify-center"} as any)}>
                  <svg {...({"width":"16","height":"16","viewBox":"0 0 16 16","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon-xs"} as any)}>
                    <path {...({"d":"M8 4.2168C8.24838 4.21697 8.44922 4.41857 8.44922 4.66699V7.8623C8.44911 8.06977 8.36732 8.26924 8.2207 8.41602L6.65137 9.98535C6.4756 10.1607 6.19025 10.161 6.01465 9.98535C5.83909 9.80975 5.83934 9.52439 6.01465 9.34863L7.5498 7.81348V4.66699C7.5498 4.41862 7.75168 4.21704 8 4.2168Z","fill":"currentColor"} as any)} />
                    <path {...({"fillRule":"evenodd","clipRule":"evenodd","d":"M8 1.5498C11.5622 1.5498 14.4502 4.43776 14.4502 8C14.4502 11.5622 11.5622 14.4502 8 14.4502C4.43776 14.4502 1.5498 11.5622 1.5498 8C1.5498 4.43776 4.43776 1.5498 8 1.5498ZM8 2.4502C4.93482 2.4502 2.4502 4.93482 2.4502 8C2.4502 11.0652 4.93482 13.5498 8 13.5498C11.0652 13.5498 13.5498 11.0652 13.5498 8C13.5498 4.93482 11.0652 2.4502 8 2.4502Z","fill":"currentColor"} as any)} />
                  </svg>
                </span>
                <LayoutSlot name="sidebar-shortcut-label-1" slots={slots} />
              </div>
              <div {...({"className":"relative flex size-5 shrink-0 items-center justify-center text-token-description-foreground"} as any)}>
                <span {...({"className":"icon-xs relative scale-50"} as any)}>
                  <span {...({"className":"absolute inset-0 rounded-full","style":{"backgroundColor":"var(--vscode-textLink-foreground)"}} as any)} />
                </span>
              </div>
            </button>
            <button {...({"type":"button","className":"sidebar-item focus-visible:outline-token-border relative h-[var(--height-token-row)] px-[var(--padding-row-cell-x,var(--padding-row-x))] py-row-y cursor-interaction shrink-0 items-center overflow-hidden text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 gap-2 flex w-full hover:bg-token-list-hover-background"} as any)}>
              <div {...({"className":"flex min-w-0 items-center text-base gap-2 flex-1 text-token-foreground"} as any)}>
                <span {...({"className":"flex w-4 shrink-0 items-center justify-center"} as any)}>
                  <svg {...({"width":"16","height":"16","viewBox":"0 0 16 16","fill":"none","xmlns":"http://www.w3.org/2000/svg","className":"icon-xs"} as any)}>
                    <path {...({"fillRule":"evenodd","clipRule":"evenodd","d":"M8.25031 1.46094C12.2175 1.46116 14.7053 4.56317 14.4573 8.11328C14.3646 9.44154 13.6395 10.4315 12.6556 10.834C11.7842 11.1903 10.7744 11.0568 9.95637 10.3848C9.43406 10.8255 8.8274 11.1141 8.19465 11.167C7.46206 11.2281 6.74478 10.9691 6.16535 10.3672L6.16145 10.3623C6.16145 10.3623 6.15859 10.3586 6.15656 10.3564C6.15204 10.3517 6.14556 10.344 6.13703 10.335C6.11976 10.3167 6.09427 10.29 6.06281 10.2568C5.9996 10.1901 5.90986 10.0966 5.80793 9.98926C5.60368 9.77412 5.34664 9.50307 5.1341 9.28125C4.86457 8.99958 4.87183 8.55158 5.15363 8.28027L5.31672 8.12207L4.72004 7.50195C4.5193 7.29309 4.52604 6.96077 4.73469 6.75977C4.94359 6.55869 5.27678 6.56454 5.47785 6.77344L6.07453 7.39355L7.51789 6.00391L6.92121 5.38379C6.72021 5.17497 6.72621 4.8427 6.93488 4.6416C7.14378 4.44052 7.47697 4.44638 7.67805 4.65527L8.27473 5.27539L8.44465 5.1123C8.72754 4.84001 9.17872 4.85048 9.44953 5.13477L10.4808 6.21777C11.074 6.8285 11.3084 7.55474 11.2132 8.28613C11.1518 8.75707 10.9544 9.20384 10.6683 9.60938C11.1897 10.0141 11.7752 10.0597 12.2581 9.8623C12.8307 9.6281 13.3423 9.01591 13.4105 8.04004C13.6191 5.05211 11.5645 2.51194 8.25031 2.51172C5.3194 2.51172 2.78634 4.7507 2.58918 7.57031C2.36888 10.7251 4.6005 13.3876 7.99836 13.3877C9.02878 13.3877 10.0514 13.1687 10.8314 12.7041C11.0805 12.5558 11.4027 12.6377 11.5511 12.8867C11.6992 13.1357 11.6174 13.4581 11.3685 13.6064C10.3813 14.1943 9.15795 14.4375 7.99836 14.4375C3.956 14.4374 1.28142 11.2234 1.54133 7.49805C1.77976 4.08387 4.81315 1.46094 8.25031 1.46094ZM6.12727 8.80176C6.27942 8.9613 6.43614 9.12597 6.56965 9.2666C6.67197 9.37438 6.76112 9.46823 6.82453 9.53516C6.856 9.56836 6.88138 9.59493 6.89875 9.61328L6.9261 9.6416C7.2937 10.0219 7.7023 10.154 8.10774 10.1201C8.52986 10.0848 8.998 9.86387 9.43293 9.44531C9.87269 9.02201 10.1181 8.56488 10.1722 8.14941C10.2235 7.75361 10.1099 7.34127 9.72492 6.94629L9.72102 6.94238L8.9261 6.10742L6.12727 8.80176Z","fill":"currentColor"} as any)} />
                  </svg>
                </span>
                <LayoutSlot name="sidebar-shortcut-label-2" slots={slots} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
