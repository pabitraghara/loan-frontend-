"use client";

import { useState } from "react";
import { AdminApiError } from "@/lib/admin-api";
import { useAdminAuth } from "@/components/admin/AdminAuth";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      // The API returns one generic failure for unknown user, wrong password
      // and disabled account. Do not add detail here.
      setError(
        err instanceof AdminApiError
          ? err.message
          : "Could not sign you in. Please try again.",
      );
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-900 text-sm font-bold text-white">
            R
          </span>
          <span className="text-lg font-bold tracking-tight text-brand-900">
            NewAdmin
          </span>
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h1 className="text-lg font-semibold text-brand-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">
            Authorised personnel only.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-brand-900"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-[16px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-brand-900"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-[16px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>

          <p className="mt-5 text-xs leading-relaxed text-slate-500">
            Access is logged. Revealing an applicant&apos;s Social Security
            number or bank details records your name, the time and your IP
            address against their file.
          </p>
        </form>
      </div>
    </div>
  );
}
