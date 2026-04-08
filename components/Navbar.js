"use client";

import { signOut } from "next-auth/react";

export default function Navbar({
  totalCount,
  onlineCount,
  lastUpdatedLabel,
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-gray-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-violet-300">
            LogicEye Dashboard
          </p>
          <h1 className="mt-1.5 text-xl font-semibold text-white md:text-[1.7rem]">
            VMS Installation Tracker
          </h1>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5 rounded-xl border border-gray-800 bg-gray-900/80 px-3.5 py-2.5 text-[13px] text-gray-300">
            <span>Total: {totalCount}</span>
            <span className="h-1 w-1 rounded-full bg-gray-700" />
            <span className="text-emerald-300">Online: {onlineCount}</span>
            <span className="h-1 w-1 rounded-full bg-gray-700" />
            <span>Updated {lastUpdatedLabel}</span>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-[13px] font-medium text-violet-100 transition hover:border-violet-400 hover:bg-violet-500/20"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
