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
        "relative bg-[#0D1E52] border-b border-[#C9A84C]/20",
        sticky && "sticky top-0 z-30",
        className,
      )}
      style={{ background: "linear-gradient(90deg, #0D1E52 0%, #0F2460 50%, #0D1E52 100%)" }}
    >
      <div
        className={cn(
          "page-shell flex items-center justify-between gap-6 h-[4.5rem]",
          containerClassName,
        )}
      >
        <div className="flex items-center gap-4 min-w-0">
          {leftSlot && (
            <div className="flex items-center mr-1">{leftSlot}</div>
          )}
          <Link to="/" className="shrink-0 flex items-center gap-4 group">
            <img
              src="/starlink-jewels-logo.png"
              alt="Starlink Jewels"
              className="h-9 w-auto brightness-0 invert opacity-95 group-hover:opacity-100 transition-opacity"
            />
            {portalLabel && (
              <div className="flex flex-col border-l border-[#C9A84C]/30 pl-4">
                <span className="text-[#C9A84C] text-[10px] uppercase tracking-[0.22em] font-semibold leading-none mb-1">
                  Starlink Jewels
                </span>
                <span className="text-white/90 text-[13px] font-medium leading-none tracking-wide">
                  {portalLabel}
                </span>
              </div>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {rightSlot}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{ background: "linear-gradient(90deg, transparent 0%, #C9A84C40 30%, #C9A84C60 50%, #C9A84C40 70%, transparent 100%)" }}
      />
    </header>
  );
}
