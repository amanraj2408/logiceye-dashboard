"use client";

import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import StatusBadge from "./StatusBadge";

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

function formatAbsoluteLabel(timestamp) {
  if (!timestamp) {
    return "Waiting for first ping";
  }

  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function StatCard({ label, value, accent, helper }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/80 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className={`text-xl font-semibold leading-none md:text-2xl ${accent}`}>{value}</p>
        <p className="max-w-[11rem] text-right text-[11px] leading-5 text-gray-400">
          {helper}
        </p>
      </div>
    </div>
  );
}

function InstallationDetailsModal({ installation, onClose, isHydrated }) {
  const cameraCount = installation.cameraDetails?.length || 0;

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4 border-b border-gray-800 px-5 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-gray-500">
              Installation Details
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {installation.ftpUsername}
            </h2>
            {installation.location ? (
              <p className="mt-1 text-sm text-gray-400">{installation.location}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge isOnline={installation.isOnline} />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 transition hover:border-gray-500 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>

        <div className="grid gap-4 px-5 py-5 md:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">
              Cameras
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{cameraCount}</p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">
              Last Ping
            </p>
            <p className="mt-2 text-sm font-medium text-gray-100">
              {installation.lastPing && isHydrated
                ? formatRelativeLabel(new Date(installation.lastPing))
                : "No ping received yet"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {isHydrated
                ? formatAbsoluteLabel(installation.lastPing)
                : "Loading timestamp..."}
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">
              Installation ID
            </p>
            <p className="mt-2 truncate text-lg font-semibold text-white">
              {installation.id || installation.ftpUsername}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 px-5 py-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-white">Configured Cameras</p>
              <p className="text-sm text-gray-400">
                Full stream and network details for this installation.
              </p>
            </div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">
              {cameraCount} total
            </p>
          </div>

          {cameraCount > 0 ? (
            <div className="overflow-hidden rounded-xl border border-gray-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800 text-left">
                  <thead className="bg-gray-900/90">
                    <tr className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
                      <th className="px-4 py-3 font-medium">Camera</th>
                      <th className="px-4 py-3 font-medium">IP Address</th>
                      <th className="px-4 py-3 font-medium">Stream Path</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 bg-gray-950/80">
                    {installation.cameraDetails.map((camera, index) => (
                      <tr key={`${installation.ftpUsername}-${camera.ip || index}`}>
                        <td className="px-4 py-3 text-sm font-medium text-white">
                          {camera.name || `Camera ${index + 1}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {camera.ip || "Not provided"}
                        </td>
                        <td className="max-w-sm truncate px-4 py-3 text-sm text-gray-400">
                          {camera.streamPath || "Not provided"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-800 px-4 py-8 text-center text-sm text-gray-500">
              No camera details received yet for this installation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({
  initialInstallations,
  dataError: initialDataError = "",
}) {
  const [installations, setInstallations] = useState(initialInstallations);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isHydrated, setIsHydrated] = useState(false);
  const [dataError, setDataError] = useState(initialDataError);
  const [selectedInstallation, setSelectedInstallation] = useState(null);

  useEffect(() => {
    setIsHydrated(true);

    let mounted = true;

    async function refreshInstallations() {
      try {
        const response = await fetch("/api/installations", {
          cache: "no-store",
        });

        if (!response.ok) {
          if (mounted) {
            setDataError("Unable to refresh installation data.");
          }
          return;
        }

        const data = await response.json();

        if (mounted) {
          setInstallations(data.installations || []);
          setLastUpdated(new Date());
          setDataError("");
        }
      } catch (error) {
        console.error("[Dashboard Refresh Error]", error);
        if (mounted) {
          setDataError("Unable to refresh installation data.");
        }
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
        {dataError ? (
          <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-100">
            {dataError}
          </div>
        ) : null}

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Installations"
            value={totalCount}
            accent="text-white"
            helper="Tracked VMS clients"
          />
          <StatCard
            label="Online Now"
            value={onlineCount}
            accent="text-emerald-300"
            helper="Pinged in 20 minutes"
          />
          <StatCard
            label="Offline"
            value={offlineCount}
            accent="text-red-300"
            helper="Missing recent heartbeat"
          />
          <StatCard
            label="Last Updated"
            value={mostRecentPing && isHydrated ? formatRelativeLabel(new Date(mostRecentPing)) : "N/A"}
            accent="text-violet-300"
            helper="Most recent heartbeat"
          />
        </div>

        {installations.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/70 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-violet-300">
                  Installations
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Click any row to open details
                </h2>
              </div>
              <p className="text-sm text-gray-400">{totalCount} total records</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800 text-left">
                <thead className="bg-gray-950/80">
                  <tr className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
                    <th className="px-5 py-3 font-medium">Installation</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Cameras</th>
                    <th className="px-5 py-3 font-medium">Last Ping</th>
                    <th className="px-5 py-3 font-medium">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {installations.map((installation) => (
                    <tr
                      key={installation.id || installation.ftpUsername}
                      onClick={() => setSelectedInstallation(installation)}
                      className="cursor-pointer bg-gray-950/30 transition hover:bg-violet-500/10"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">{installation.ftpUsername}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {installation.id || "No explicit ID"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge isOnline={installation.isOnline} />
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-200">
                        {installation.cameraDetails?.length || 0}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-200">
                          {installation.lastPing && isHydrated
                            ? formatRelativeLabel(new Date(installation.lastPing))
                            : "No ping yet"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {isHydrated
                            ? formatAbsoluteLabel(installation.lastPing)
                            : "Loading timestamp..."}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400">
                        {installation.location || "Not provided"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

        {selectedInstallation ? (
          <InstallationDetailsModal
            installation={selectedInstallation}
            onClose={() => setSelectedInstallation(null)}
            isHydrated={isHydrated}
          />
        ) : null}
      </section>
    </main>
  );
}
