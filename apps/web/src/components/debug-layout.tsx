import { Outlet } from "react-router";
import { DebugRouteSwitcher } from "./debug-route-switcher";

export function DebugLayout() {
  return (
    <>
      <Outlet />
      <DebugRouteSwitcher />
    </>
  );
}
