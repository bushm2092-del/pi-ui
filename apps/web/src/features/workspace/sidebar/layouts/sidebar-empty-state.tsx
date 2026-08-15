export function SidebarEmptyState({ label }: { label: string }) {
  return (
    <div className="px-8 py-1 text-base text-token-description-foreground opacity-50">
      {label}
    </div>
  );
}
