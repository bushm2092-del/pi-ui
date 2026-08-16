import { MainHeader } from "./main-header";
import { MainSurfaceLayout } from "./layouts";
import { MainViewport } from "./main-viewport";

export function MainSurface() {
  return (
    <MainSurfaceLayout
      header={<MainHeader />}
      viewport={<MainViewport />}
    />
  );
}
