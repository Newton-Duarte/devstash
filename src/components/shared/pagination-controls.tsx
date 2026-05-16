import { type ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  basePath: string;
  currentPage: number;
  totalPages: number;
}

function getPageHref(basePath: string, page: number) {
  return page === 1 ? basePath : `${basePath}?page=${page}`;
}

function PaginationLink({
  basePath,
  children,
  className,
  disabled = false,
  page,
}: {
  basePath: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  page: number;
}) {
  const sharedClassName = cn(
    "inline-flex h-10 min-w-10 items-center justify-center rounded-2xl border border-white/10 px-3 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    disabled
      ? "pointer-events-none bg-white/[0.02] text-slate-600"
      : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white",
    className
  );

  if (disabled) {
    return (
      <span aria-disabled="true" className={sharedClassName}>
        {children}
      </span>
    );
  }

  return (
    <Link className={sharedClassName} href={getPageHref(basePath, page)} prefetch={false}>
      {children}
    </Link>
  );
}

export function PaginationControls({
  basePath,
  currentPage,
  totalPages,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      <PaginationLink basePath={basePath} disabled={currentPage === 1} page={currentPage - 1}>
        Prev
      </PaginationLink>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
        const isCurrentPage = page === currentPage;

        return (
          <Link
            aria-current={isCurrentPage ? "page" : undefined}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-2xl border text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              isCurrentPage
                ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100"
                : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
            )}
            href={getPageHref(basePath, page)}
            key={page}
            prefetch={false}
          >
            {page}
          </Link>
        );
      })}

      <PaginationLink
        basePath={basePath}
        disabled={currentPage === totalPages}
        page={currentPage + 1}
      >
        Next
      </PaginationLink>
    </nav>
  );
}
