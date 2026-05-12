import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { login, isAuthed } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [u, setU] = useState("admin");
  const [p, setP] = useState("");

  useEffect(() => {
    if (isAuthed()) navigate({ to: "/" });
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 text-white">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, #2a52a8 0%, transparent 45%), radial-gradient(circle at 70% 70%, #0a1f4d 0%, transparent 50%)",
        }}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#06122e]/80 p-8 backdrop-blur-md">
        <div className="mb-6 text-center">
          <div className="mx-auto inline-block rounded-md bg-white px-3 py-2">
            <img
              src="https://starlinkjewels.com/assets/starlink-logo-horizontal-DJzhPoqe.png"
              alt="Starlink Jewels"
              className="h-9 w-auto"
            />
          </div>
          <h1 className="mt-5 font-display text-2xl tracking-[0.3em] text-white">QUOTATION</h1>
          <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-white/50">
            Internal Sales Portal
          </p>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (login(u, p)) {
              toast.success("Welcome back");
              navigate({ to: "/" });
            } else {
              toast.error("Invalid credentials");
            }
          }}
        >
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-white/60">
              Username
            </Label>
            <Input
              value={u}
              onChange={(e) => setU(e.target.value)}
              className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wider text-white/60">
              Password
            </Label>
            <Input
              type="password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>
          <Button
            type="submit"
            className="w-full gold-gradient text-white hover:opacity-90"
          >
            Sign in
          </Button>
          <p className="text-center text-[11px] text-white/40">
            Demo credentials: <span className="text-white/80">admin / 123</span>
          </p>
        </form>
      </div>
    </div>
  );
}