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
        "brand-header border-b border-primary/10 text-primary shadow-[0_8px_30px_rgba(47,95,183,0.08)]",
        sticky && "sticky top-0 z-20",
        className,
      )}
    >
      <div
        className={cn(
          "app-shell flex flex-wrap items-center justify-between gap-4 py-3.5",
          containerClassName,
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          {leftSlot}
          <Link
            to="/"
            className="shrink-0 transition hover:opacity-90"
          >
            <img
              src="/starlink-jewels-logo.png"
              alt="Starlink Jewels"
              className="h-9 w-auto sm:h-10"
            />
          </Link>
          {portalLabel ? (
            <div className="hidden min-w-0 border-l border-primary/12 pl-3 md:block">
              <div className="text-[10px] font-medium uppercase tracking-[0.24em] text-primary/45">
                Starlink Jewels
              </div>
              <div className="truncate font-display text-lg leading-none text-primary/82">
                {portalLabel}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
