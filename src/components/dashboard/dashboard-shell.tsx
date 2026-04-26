import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DashboardShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search items"
              className="pl-10"
              placeholder="Search snippets, prompts, notes, and commands"
            />
          </div>

          <Button className="w-full sm:w-auto">
            <Plus className="size-4" />
            New Item
          </Button>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-dashed border-border bg-card/60 p-6">
            <h2 className="text-lg font-semibold">Sidebar</h2>
          </aside>

          <main className="rounded-3xl border border-dashed border-border bg-card/60 p-6">
            <h2 className="text-lg font-semibold">Main</h2>
          </main>
        </div>
      </div>
    </div>
  );
}
