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
        "bg-white border-b-2 border-slate-100 shadow-sm",
        sticky && "sticky top-0 z-20",
        className,
      )}
    >
      <div
        className={cn(
          "max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 h-16",
          containerClassName,
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {leftSlot}
          <Link to="/" className="shrink-0 flex items-center gap-3 hover:opacity-90 transition">
            <img
              src="/starlink-jewels-logo.png"
              alt="Starlink Jewels"
              className="h-9 w-auto"
            />
            {portalLabel && (
              <div className="hidden sm:block border-l-2 border-slate-200 pl-3">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-medium leading-none mb-0.5">Starlink Jewels</p>
                <p className="text-sm font-semibold text-slate-700 leading-none">{portalLabel}</p>
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
