import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useAppStore } from "@/stores/app-store";

export function AppToaster() {
  const preference = useAppStore((state) => state.theme);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const theme = preference === "system" ? (systemDark ? "dark" : "light") : preference;
  return <Toaster theme={theme} position="top-right" richColors closeButton />;
}
