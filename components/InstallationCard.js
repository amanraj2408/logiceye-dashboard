"use client";

import { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge";

function formatRelativeTime(timestamp) {
  if (!timestamp) {
    return "No ping received yet";
  }

  const now = Date.now();
  const date = new Date(timestamp).getTime();
  const diffInSeconds = Math.round((date - now) / 1000);
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
  let duration = diffInSeconds;

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
    }

    duration /= division.amount;
  }

  return "Updated recently";
}

function formatAbsoluteTime(timestamp) {
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

export default function InstallationCard({ installation }) {
  const cameraCount = installation.cameraDetails?.length || 0;
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <article
      className={`group rounded-2xl border bg-gray-900/90 p-4 transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 ${
        installation.isOnline
          ? "border-emerald-500/20 shadow-online"
          : "border-gray-800 shadow-offline"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-gray-500">
            Installation ID
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white md:text-[1.75rem]">
            {installation.ftpUsername}
          </h2>
          {installation.location ? (
            <p className="mt-1.5 text-[13px] text-gray-400">{installation.location}</p>
          ) : null}
        </div>

        <StatusBadge isOnline={installation.isOnline} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-800 bg-gray-950/80 p-3.5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
            Cameras
          </p>
          <p className="mt-2 text-[1.9rem] font-semibold leading-none text-white">
            {cameraCount}
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-950/80 p-3.5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
            Last Ping
          </p>
          <p className="mt-2 text-[13px] font-medium text-gray-200">
            {isHydrated ? formatRelativeTime(installation.lastPing) : "Updated recently"}
          </p>
          <p className="mt-1 text-[12px] text-gray-500">
            {isHydrated
              ? formatAbsoluteTime(installation.lastPing)
              : "Loading timestamp..."}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950/70 p-3.5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-gray-200">Camera List</p>
          <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">
            {cameraCount} configured
          </p>
        </div>

        {cameraCount > 0 ? (
          <div className="space-y-2.5">
            {installation.cameraDetails.map((camera, index) => (
              <div
                key={`${installation.ftpUsername}-${camera.ip || index}`}
                className="rounded-xl border border-gray-800 bg-gray-900 px-3.5 py-3"
              >
                <p className="text-[14px] font-medium text-white">
                  {camera.name || `Camera ${index + 1}`}
                </p>
                <p className="mt-1 text-[13px] text-gray-400">
                  IP: {camera.ip || "Not provided"}
                </p>
                {camera.streamPath ? (
                  <p className="mt-1 truncate text-[12px] text-gray-500">
                    Stream: {camera.streamPath}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-800 px-4 py-5 text-center text-[13px] text-gray-500">
            No camera details received yet for this installation.
          </div>
        )}
      </div>
    </article>
  );
}
