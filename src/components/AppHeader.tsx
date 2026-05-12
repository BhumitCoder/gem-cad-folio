import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

type AppHeaderProps = {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  portalLabel?: string;
  sticky?: boolean;
  className?: string;
  containerClassName?: string;
};

export function AppHeader({
  leftSlot,
  rightSlot,
  portalLabel,
  sticky = false,
  className,
  containerClassName,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "brand-header border-b border-primary/10 text-primary shadow-sm",
        sticky && "sticky top-0 z-20",
        className,
      )}
    >
      <div
        className={cn(
          "app-shell flex flex-wrap items-center justify-between gap-4 py-4",
          containerClassName,
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
          {leftSlot}
          <Link
            to="/"
            className="shrink-0 transition hover:opacity-90"
          >
            <img
              src="/starlink-jewels-logo.png"
              alt="Starlink Jewels"
              className="h-10 w-auto sm:h-11"
            />
          </Link>
          {portalLabel ? (
            <>
              <div className="hidden h-7 w-px bg-primary/12 md:block" />
              <span className="hidden font-display text-sm uppercase tracking-[0.28em] text-primary/70 md:block">
                {portalLabel}
              </span>
            </>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
