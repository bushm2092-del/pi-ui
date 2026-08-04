import { ThreadFrame } from "../thread";
import { MainViewportLayout } from "./layouts";

export function MainViewport() {
  return (
    <MainViewportLayout>
      <ThreadFrame />
    </MainViewportLayout>
  );
}
