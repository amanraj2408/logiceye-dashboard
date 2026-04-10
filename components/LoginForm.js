"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function CameraShieldIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-16 w-16"
    >
      <defs>
        <linearGradient id="logicEyeLoginGradient" x1="8" y1="8" x2="56" y2="56">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <path
        d="M32 6L50 12V28C50 40.2 42.5 51.3 32 56C21.5 51.3 14 40.2 14 28V12L32 6Z"
        fill="url(#logicEyeLoginGradient)"
        stroke="#C4B5FD"
        strokeWidth="2"
      />
      <rect x="20" y="22" width="24" height="14" rx="7" fill="#0F172A" />
      <circle cx="32" cy="29" r="5" fill="#A78BFA" />
      <circle cx="32" cy="29" r="2" fill="#F8FAFC" />
      <path
        d="M44 24L52 20V38L44 34V24Z"
        fill="#312E81"
        stroke="#C4B5FD"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    searchParams.get("error") ? "Invalid username or password." : ""
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (result?.error) {
      setError("Invalid username or password.");
      setLoading(false);
      return;
    }

    window.location.href = result?.url || "/dashboard";
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 px-5 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.24),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.18),_transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900/80 p-6 shadow-2xl shadow-violet-950/50 backdrop-blur">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3">
            <CameraShieldIcon />
          </div>
          <h1 className="text-[2rem] font-semibold tracking-tight text-white">
            LogicEye
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-violet-300">
            Installation Tracker
          </p>
          <p className="mt-3 max-w-sm text-[13px] leading-6 text-gray-400">
            Secure access to the live installation dashboard for all LogicEye
            VMS deployments.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-[13px] font-medium text-gray-300"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-[13px] text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-[13px] font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-[13px] text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
              placeholder="Enter your password"
              required
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:scale-[1.01] hover:shadow-lg hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
