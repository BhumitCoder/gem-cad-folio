import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAuthed, login, signup } from "@/lib/auth";

import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthed()) navigate({ to: "/" });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Enter email and password");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        await login(email, password);
        toast.success("Welcome back");
      } else {
        await signup(email, password);
        toast.success("Account created");
      }
      navigate({ to: "/" });
    } catch (err) {
      const msg = (err as Error)?.message || "Authentication failed";
      toast.error(msg.replace("Firebase: ", ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 24%, rgba(82, 124, 205, 0.26) 0%, transparent 34%), radial-gradient(circle at 82% 18%, rgba(42, 83, 168, 0.18) 0%, transparent 30%), radial-gradient(circle at 75% 78%, rgba(14, 33, 79, 0.12) 0%, transparent 34%)",
          }}
        />
        <div className="relative z-10 w-full max-w-md rounded-[28px] border border-primary/12 bg-white/88 p-8 shadow-[0_24px_80px_rgba(24,51,112,0.16)] backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto flex w-fit items-center justify-center rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-primary/10">
              <img
                src="/starlink-jewels-logo.png"
                alt="Starlink Jewels"
                className="h-16 w-auto"
              />
            </div>
            <h1 className="mt-6 font-display text-4xl text-foreground">
              {mode === "signin" ? "Sign in" : "Create account"}
            </h1>
            <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Starlink Jewels Portal
            </p>
          </div>
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@starlinkjewels.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-border bg-white/90 text-foreground placeholder:text-muted-foreground/70"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-border bg-white/90 text-foreground placeholder:text-muted-foreground/70"
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="h-11 w-full gold-gradient text-white hover:opacity-90"
            >
              {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {mode === "signin" ? "First time here?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-medium text-primary hover:underline"
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
