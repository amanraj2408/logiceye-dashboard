"use client";

import { useEffect, useState } from "react";
import InstallationCard from "./InstallationCard";
import Navbar from "./Navbar";

function formatRelativeLabel(date) {
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const divisions = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" },
  ];
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  let duration = seconds;

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
    }

    duration /= division.amount;
  }

  return "recently";
}

function StatCard({ label, value, accent, helper }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4 md:p-5">
      <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">{label}</p>
      <p className={`mt-3 text-2xl font-semibold md:text-[2rem] ${accent}`}>{value}</p>
      <p className="mt-2 text-[13px] leading-6 text-gray-400">{helper}</p>
    </div>
  );
}

export default function DashboardClient({ initialInstallations }) {
  const [installations, setInstallations] = useState(initialInstallations);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    let mounted = true;

    async function refreshInstallations() {
      try {
        const response = await fetch("/api/installations", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (mounted) {
          setInstallations(data.installations || []);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error("[Dashboard Refresh Error]", error);
      }
    }

    const interval = setInterval(refreshInstallations, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const totalCount = installations.length;
  const onlineCount = installations.filter(
    (installation) => installation.isOnline
  ).length;
  const offlineCount = totalCount - onlineCount;
  const mostRecentPing = installations.find(
    (installation) => installation.lastPing
  )?.lastPing;

  return (
    <main className="min-h-screen bg-transparent pb-8">
      <Navbar
        totalCount={totalCount}
        onlineCount={onlineCount}
        lastUpdatedLabel={isHydrated ? formatRelativeLabel(lastUpdated) : "just now"}
      />

      <section className="mx-auto max-w-6xl px-5 py-6">
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Installations"
            value={totalCount}
            accent="text-white"
            helper="All registered VMS clients tracked by LogicEye."
          />
          <StatCard
            label="Online Now"
            value={onlineCount}
            accent="text-emerald-300"
            helper="Installations that pinged within the last 20 minutes."
          />
          <StatCard
            label="Offline"
            value={offlineCount}
            accent="text-red-300"
            helper="Installations missing recent heartbeats."
          />
          <StatCard
            label="Last Updated"
            value={mostRecentPing && isHydrated ? formatRelativeLabel(new Date(mostRecentPing)) : "N/A"}
            accent="text-violet-300"
            helper="Most recent heartbeat seen by the dashboard."
          />
        </div>

        {installations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {installations.map((installation) => (
              <InstallationCard
                key={installation.id || installation.ftpUsername}
                installation={installation}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-800 bg-gray-900/60 px-6 py-16 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-violet-300">
              Waiting For Installations
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white md:text-[2rem]">
              No VMS pings received yet
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[13px] leading-7 text-gray-400">
              Once the LogicEye VMS backend begins sending pings to
              <span className="mx-1 rounded bg-gray-800 px-2 py-1 text-gray-200">
                /api/ping
              </span>
              every 15 minutes, installations will appear here automatically.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
