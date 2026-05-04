import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, formatApiError } from "../context/AuthContext";
import { ArrowRight } from "lucide-react";

export default function AdminLogin() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      const dest = loc.state?.from || "/admin";
      nav(dest, { replace: true });
    } catch (e) {
      setErr(formatApiError(e?.response?.data?.detail) || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      data-testid="admin-login-page"
      className="min-h-screen bg-[hsl(var(--obsidian))] flex items-center justify-center px-5"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img
            src="/lumiere-logo.png"
            alt="Lumière"
            className="h-20 w-auto mx-auto"
          />
          <div className="text-[hsl(var(--gold))] text-[10px] tracking-luxury uppercase mt-4">
            Studio · Admin
          </div>
        </div>

        <form
          onSubmit={submit}
          data-testid="admin-login-form"
          className="bg-[hsl(0_0%_5%)] border border-[hsl(var(--gold)/0.2)] p-8 sm:p-10"
        >
          <h1 className="font-display text-[hsl(var(--ivory))] text-2xl sm:text-3xl font-light italic mb-1">
            Welcome back
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mb-7">
            Sign in to manage leads & social posts.
          </p>

          <div className="mb-2">
            <label className="text-[10px] tracking-luxury uppercase text-[hsl(var(--muted-foreground))]">
              Email
            </label>
            <input
              data-testid="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="lux-input"
              placeholder="you@studio.com"
              required
              autoFocus
            />
          </div>
          <div className="mb-2">
            <label className="text-[10px] tracking-luxury uppercase text-[hsl(var(--muted-foreground))]">
              Password
            </label>
            <input
              data-testid="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="lux-input"
              placeholder="••••••••"
              required
            />
          </div>

          {err && (
            <div
              data-testid="login-error"
              className="mt-4 p-3 border border-red-500/40 bg-red-500/5 text-red-300 text-sm"
            >
              {err}
            </div>
          )}

          <button
            data-testid="login-submit"
            type="submit"
            disabled={loading}
            className="btn-gold w-full justify-center mt-8 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </main>
  );
}
