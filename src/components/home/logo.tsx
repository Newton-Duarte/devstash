import { DatabaseZap } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link className="flex items-center gap-2 text-sm font-bold text-white" href="/">
      <span className="flex size-6 items-center justify-center rounded-md border border-white/15 bg-white/5">
        <DatabaseZap className="size-3.5" aria-hidden="true" />
      </span>
      DevStash
    </Link>
  );
}
