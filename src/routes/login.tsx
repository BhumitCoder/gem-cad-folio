import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isAuthed, login } from "@/lib/auth";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, Gem } from "lucide-react";

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
    <div className="login-page">
      {/* Animated orb background */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      {/* Noise texture overlay */}
      <div className="login-noise" />

      <div className="login-content">
        {/* Brand header */}
        <div className="login-brand">
          <div className="login-logo-wrap">
            <img
              src="/starlink-jewels-logo.png"
              alt="Starlink Jewels"
              className="login-logo-img"
            />
          </div>
          <h1 className="login-brand-name">Starlink Jewels</h1>
          <div className="login-brand-divider">
            <span className="login-divider-line" />
            <Gem className="login-divider-gem" />
            <span className="login-brand-tag">Quotation Portal</span>
            <Gem className="login-divider-gem" />
            <span className="login-divider-line" />
          </div>
        </div>

        {/* Glass card */}
        <div className="glass-card login-card">
          <div className="login-card-header">
            <h2 className="login-title">Welcome back</h2>
            <p className="login-subtitle">Sign in to access your portal</p>
          </div>

          <form onSubmit={submit} className="login-form">
            <div className="login-field">
              <label className="glass-label">Username</label>
              <input
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="glass-input"
              />
            </div>

            <div className="login-field">
              <label className="glass-label">Password</label>
              <div className="glass-input-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input"
                  style={{ paddingRight: "3rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="glass-eye-btn"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="gold-btn"
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
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </span>
              )}
            </button>
          </form>

          <p className="login-footer-text">Custom Jewelry Quotation Management</p>
        </div>
      </div>
    </div>
  );
}
