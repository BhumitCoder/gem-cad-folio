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
        "navy-gradient border-b border-white/10 shadow-lg",
        sticky && "sticky top-0 z-30",
        className,
      )}
    >
      <div
        className={cn(
          "page-shell flex items-center justify-between gap-4 h-[4.25rem]",
          containerClassName,
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {leftSlot && (
            <div className="flex items-center mr-1">{leftSlot}</div>
          )}
          <Link to="/" className="shrink-0 flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="bg-white rounded-xl px-3 py-1.5 shadow-md">
              <img
                src="/starlink-jewels-logo.png"
                alt="Starlink Jewels"
                className="h-8 w-auto"
              />
            </div>
            {portalLabel && (
              <div className="hidden sm:flex flex-col">
                <span className="text-white/50 text-[10px] uppercase tracking-[0.18em] font-medium leading-none mb-0.5">
                  Starlink Jewels
                </span>
                <span className="text-white text-sm font-semibold leading-none tracking-wide">
                  {portalLabel}
                </span>
              </div>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
