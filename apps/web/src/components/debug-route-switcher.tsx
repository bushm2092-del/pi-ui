import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Bug, LayoutDashboard, MessageSquareText, PanelsTopLeft, Workflow } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const debugRoutes = [
  { path: "/", label: "工作区", icon: LayoutDashboard },
  { path: "/test/a2ui-stream", label: "A2UI 流式测试", icon: Workflow },
  { path: "/test/messages", label: "消息渲染测试", icon: MessageSquareText },
  { path: "/test/components", label: "Shadcn 组件测试", icon: PanelsTopLeft },
] as const;

const STORAGE_KEY = "pi-debug-route-switcher-position";
const BUTTON_SIZE = 40;
const VIEWPORT_PADDING = 8;
const DRAG_THRESHOLD = 4;

interface Position {
  x: number;
  y: number;
}

function constrainPosition({ x, y }: Position): Position {
  return {
    x: Math.min(Math.max(VIEWPORT_PADDING, x), Math.max(VIEWPORT_PADDING, window.innerWidth - BUTTON_SIZE - VIEWPORT_PADDING)),
    y: Math.min(Math.max(VIEWPORT_PADDING, y), Math.max(VIEWPORT_PADDING, window.innerHeight - BUTTON_SIZE - VIEWPORT_PADDING)),
  };
}

function initialPosition(): Position {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return constrainPosition(JSON.parse(saved) as Position);
  } catch {
    // Ignore unavailable storage or malformed debug state.
  }
  return constrainPosition({ x: window.innerWidth - BUTTON_SIZE - 16, y: window.innerHeight - BUTTON_SIZE - 16 });
}

export function DebugRouteSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | undefined>(undefined);
  const draggedRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setPosition((current) => constrainPosition(current));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    setMenuOpen(false);
    draggedRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (!draggedRef.current && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return;
    draggedRef.current = true;
    setPosition(constrainPosition({ x: drag.originX + deltaX, y: drag.originY + deltaY }));
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = undefined;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (draggedRef.current) {
      setPosition((current) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        } catch {
          // Dragging remains available when persistent storage is unavailable.
        }
        return current;
      });
    } else {
      setMenuOpen((current) => !current);
    }
  };

  if (!import.meta.env.DEV) return null;

  return (
    <div
      className="fixed z-[100]"
      data-debug-route-switcher=""
      data-dragging={dragRef.current ? "true" : "false"}
      style={{ left: position.x, top: position.y }}
    >
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-10 touch-none rounded-full shadow-lg cursor-grab active:cursor-grabbing"
            aria-label="打开 Debug 路由"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => { dragRef.current = undefined; }}
            onClick={(event) => event.preventDefault()}
          >
            <Bug className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-52" aria-label="Debug 路由">
          <DropdownMenuLabel>Debug 路由</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={location.pathname} onValueChange={navigate}>
            {debugRoutes.map(({ path, label, icon: Icon }) => (
              <DropdownMenuRadioItem key={path} value={path}>
                <Icon className="size-4" />
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
