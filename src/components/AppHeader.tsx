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
        "glass-header",
        sticky && "sticky top-0 z-30",
        className,
      )}
    >
      <div
        className={cn(
          "page-shell flex items-center justify-between gap-6 h-[4.25rem]",
          containerClassName,
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {leftSlot && (
            <div className="flex items-center mr-2">{leftSlot}</div>
          )}
          <Link to="/" className="shrink-0 flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <img
                src="/starlink-jewels-logo.png"
                alt="Starlink Jewels"
                className="h-5 w-auto"
                style={{ filter: "brightness(0) invert(1)", opacity: 0.9 }}
              />
            </div>
            {portalLabel && (
              <div className="flex flex-col border-l pl-3" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", opacity: 0.85, lineHeight: 1, marginBottom: "0.2rem" }}>
                  Starlink Jewels
                </span>
                <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1, letterSpacing: "0.01em" }}>
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

      {/* Gold accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.35) 30%, rgba(201,168,76,0.5) 50%, rgba(201,168,76,0.35) 70%, transparent 100%)" }}
      />
    </header>
  );
}
