import type { ComponentType } from "react";
import {
  ProjectItemLayout0,
  ProjectItemLayout1,
  ProjectItemLayout2,
  ProjectItemLayout3,
  ProjectItemLayout4,
  ProjectItemLayout5,
  ProjectRowLayout0,
  ProjectRowLayout1,
  ProjectRowLayout2,
  ProjectRowLayout3,
  ProjectRowLayout4,
  ProjectThreadsLayout0,
  ProjectThreadsLayout1,
  ProjectThreadsLayout2,
  ProjectThreadsLayout3,
  ThreadItemLayout0_0_Active,
  ThreadItemLayout0_0_Inactive,
  ThreadItemLayout0_1_Active,
  ThreadItemLayout0_1_Inactive,
  ThreadItemLayout3_0_Active,
  ThreadItemLayout3_0_Inactive,
  ThreadItemLayout3_1_Active,
  ThreadItemLayout3_1_Inactive,
  ThreadItemLayout3_2_Active,
  ThreadItemLayout3_2_Inactive,
  ThreadItemLayout3_3_Active,
  ThreadItemLayout3_3_Inactive,
  ThreadItemLayout3_4_Active,
  ThreadItemLayout3_4_Inactive,
  ThreadItemLayout3_5_Active,
  ThreadItemLayout3_5_Inactive,
  type LayoutProps,
} from "./layouts";

type Layout = ComponentType<LayoutProps>;

export const projectItemLayouts: Layout[] = [
  ProjectItemLayout0,
  ProjectItemLayout1,
  ProjectItemLayout2,
  ProjectItemLayout3,
  ProjectItemLayout4,
  ProjectItemLayout5,
];

export const projectRowLayouts: Layout[] = [
  ProjectRowLayout0,
  ProjectRowLayout1,
  ProjectRowLayout2,
  ProjectRowLayout3,
  ProjectRowLayout4,
];

export const projectThreadsLayouts: Layout[] = [
  ProjectThreadsLayout0,
  ProjectThreadsLayout1,
  ProjectThreadsLayout2,
  ProjectThreadsLayout3,
];

const threadItemLayouts: Record<number, Array<[Layout, Layout]>> = {
  0: [
    [ThreadItemLayout0_0_Inactive, ThreadItemLayout0_0_Active],
    [ThreadItemLayout0_1_Inactive, ThreadItemLayout0_1_Active],
  ],
  3: [
    [ThreadItemLayout3_0_Inactive, ThreadItemLayout3_0_Active],
    [ThreadItemLayout3_1_Inactive, ThreadItemLayout3_1_Active],
    [ThreadItemLayout3_2_Inactive, ThreadItemLayout3_2_Active],
    [ThreadItemLayout3_3_Inactive, ThreadItemLayout3_3_Active],
    [ThreadItemLayout3_4_Inactive, ThreadItemLayout3_4_Active],
    [ThreadItemLayout3_5_Inactive, ThreadItemLayout3_5_Active],
  ],
};

export function getThreadItemLayout(
  projectIndex: number,
  threadIndex: number,
  active: boolean,
) {
  return threadItemLayouts[projectIndex]?.[threadIndex]?.[active ? 1 : 0];
}
