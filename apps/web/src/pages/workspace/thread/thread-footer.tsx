import { Composer } from "../composer";
import { ThreadFooterLayout } from "./layouts";

export function ThreadFooter() {
  return <ThreadFooterLayout composer={<Composer />} />;
}
