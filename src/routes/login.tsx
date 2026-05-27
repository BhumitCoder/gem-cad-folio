import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isAuthed, login } from "@/lib/auth";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthed()) navigate({ to: "/" });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Please enter your username and password");
      return;
    }
    setBusy(true);
    try {
      await login(username, password);
      toast.success("Welcome back!");
      navigate({ to: "/" });
    } catch (err) {
      toast.error((err as Error)?.message || "Invalid credentials");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left brand panel ── */}
      <div className="navy-gradient diamond-pattern relative flex flex-col items-center justify-center lg:w-[55%] py-16 px-8 lg:px-16 overflow-hidden">

        {/* Decorative blurs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)" }} />

        <div className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto">
          {/* Logo */}
          <div className="bg-white rounded-2xl px-8 py-5 shadow-2xl mb-8">
            <img
              src="/starlink-jewels-logo.png"
              alt="Starlink Jewels"
              className="h-20 w-auto"
            />
          </div>

          {/* Brand name */}
          <h1 className="font-display text-white text-4xl lg:text-5xl font-bold tracking-wide leading-tight mb-3">
            Starlink Jewels
          </h1>

          {/* Gold divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C9A84C]" />
            <div className="w-2 h-2 bg-[#C9A84C] rotate-45 shrink-0" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C9A84C]" />
          </div>

          <p className="text-white/70 text-base tracking-widest uppercase font-medium">
            Quotation Portal
          </p>

          <p className="text-white/45 text-sm mt-6 leading-relaxed max-w-xs hidden lg:block">
            Manage custom jewelry quotations with elegance and precision.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-[#F5F4F0] px-6 py-12 lg:py-0">
        <div className="w-full max-w-[400px]">

          <div className="mb-8">
            <h2 className="font-display text-navy text-3xl font-bold mb-2">Welcome back</h2>
            <p className="text-gray-500 text-sm">Sign in to access your portal</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-premium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-navy w-full h-12 rounded-xl flex items-center justify-center gap-2.5 text-sm mt-2"
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Gold divider */}
          <div className="mt-10 pt-6 border-t border-[#E2E1DC] flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#C9A84C] rotate-45" />
            <p className="text-gray-400 text-xs text-center tracking-wider uppercase">
              Custom Jewelry Quotations
            </p>
            <div className="w-1.5 h-1.5 bg-[#C9A84C] rotate-45" />
          </div>
        </div>
      </div>

    </div>
  );
}
