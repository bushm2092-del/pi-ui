import { MainHeaderContext } from "./main-header-context";
import { MainHeaderLayout } from "./layouts";

export function MainHeader() {
  return <MainHeaderLayout slots={{ "main-header-context": MainHeaderContext }} />;
}
