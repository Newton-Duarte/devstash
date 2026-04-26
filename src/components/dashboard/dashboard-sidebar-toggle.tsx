import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DashboardSidebarToggleProps {
  collapsed: boolean;
  onClick: () => void;
}

export function DashboardSidebarToggle({
  collapsed,
  onClick,
}: DashboardSidebarToggleProps) {
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <Button
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="hidden lg:inline-flex"
      onClick={onClick}
      size="icon"
      type="button"
      variant="outline"
    >
      <Icon className="size-4" />
    </Button>
  );
}
