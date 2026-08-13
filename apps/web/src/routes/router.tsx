import { createHashRouter } from "react-router";
import { AppShell } from "../components/layout/app-shell";
import { HomePage } from "../features/home/home-page";
import { SettingsPage } from "./settings-page";

export const router = createHashRouter([
  { path: "/", element: <AppShell />, children: [
    { index: true, element: <HomePage /> },
    { path: "settings", element: <SettingsPage /> }
  ] }
]);
