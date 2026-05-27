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
    <header className={cn("ios-nav", sticky && "sticky top-0 z-30", className)}>
      <div className={cn("ios-nav-inner", containerClassName)}>

        <div className="ios-nav-left">
          {leftSlot && <div className="ios-nav-back">{leftSlot}</div>}
          {!leftSlot && (
            <Link to="/" className="ios-nav-brand">
              <img
                src="/starlink-jewels-logo.png"
                alt="Starlink Jewels"
                className="ios-nav-logo"
              />
              <span className="ios-nav-brand-name">Starlink Jewels</span>
            </Link>
          )}
        </div>

        {title && (
          <div className="ios-nav-title">{title}</div>
        )}

        <div className="ios-nav-right">
          {rightSlot}
        </div>

      </div>
    </header>
  );
}
