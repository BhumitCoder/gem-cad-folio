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
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #070F2B 0%, #0D1E52 40%, #0F2460 70%, #071540 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(201,168,76,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(201,168,76,0.04) 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-[440px] mx-6">
        <div className="text-center mb-10">
          <img
            src="/starlink-jewels-logo.png"
            alt="Starlink Jewels"
            className="h-16 w-auto mx-auto mb-6 brightness-0 invert opacity-95"
          />
          <h1 className="font-display text-white text-3xl font-bold tracking-wide mb-2">
            Starlink Jewels
          </h1>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px flex-1 max-w-[60px]" style={{ background: "linear-gradient(90deg, transparent, #C9A84C)" }} />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-[10px] uppercase tracking-[0.25em] font-semibold">Quotation Portal</span>
            <div className="w-1.5 h-1.5 rotate-45 bg-[#C9A84C]" />
            <div className="h-px flex-1 max-w-[60px]" style={{ background: "linear-gradient(90deg, #C9A84C, transparent)" }} />
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(201,168,76,0.15)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="px-8 py-8">
            <div className="mb-7">
              <h2 className="text-white text-xl font-semibold mb-1">Welcome back</h2>
              <p className="text-white/40 text-sm">Sign in to access your portal</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-[#C9A84C] uppercase tracking-[0.18em] mb-2">
                  Username
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="login-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#C9A84C] uppercase tracking-[0.18em] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full h-12 rounded-xl flex items-center justify-center gap-2.5 text-sm font-semibold mt-2 transition-all"
                style={{
                  background: busy
                    ? "rgba(201,168,76,0.5)"
                    : "linear-gradient(135deg, #C9A84C 0%, #E8C96A 100%)",
                  color: "#0D1E52",
                  boxShadow: busy ? "none" : "0 4px 20px rgba(201,168,76,0.3)",
                }}
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
          </div>

          <div
            className="px-8 py-4 flex items-center justify-center gap-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="w-1 h-1 rotate-45 bg-[#C9A84C]/50" />
            <p className="text-white/25 text-xs tracking-widest uppercase">
              Custom Jewelry Quotations
            </p>
            <div className="w-1 h-1 rotate-45 bg-[#C9A84C]/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
