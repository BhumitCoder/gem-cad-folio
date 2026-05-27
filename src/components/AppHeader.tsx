import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  title?: string;
  sticky?: boolean;
  className?: string;
  containerClassName?: string;
};

export function AppHeader({
  leftSlot,
  rightSlot,
  title,
  sticky = false,
  className,
  containerClassName,
}: AppHeaderProps) {
  return (
    <header className={cn("app-header", sticky && "sticky top-0 z-30", className)}>
      <div className={cn("app-header-inner", containerClassName)}>

        {/* Left: back button OR brand */}
        <div className="flex items-center gap-3 min-w-0">
          {leftSlot ? (
            <>
              {leftSlot}
              {title && (
                <span
                  className="hidden sm:block text-sm font-semibold text-white/70"
                  style={{ borderLeft: "1px solid rgba(255,255,255,0.15)", paddingLeft: "0.75rem" }}
                >
                  {title}
                </span>
              )}
            </>
          ) : (
            <Link to="/" className="app-header-brand">
              <img
                src="/starlink-jewels-logo.png"
                alt="Starlink Jewels"
                className="app-header-logo"
              />
              <div className="app-header-brand-text">
                <span className="app-header-brand-name">Starlink Jewels</span>
                <span className="app-header-brand-sub">Quotation Portal</span>
              </div>
            </Link>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightSlot}
        </div>

      </div>
    </header>
  );
}
