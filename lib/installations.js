const ONE_MINUTE = 60 * 1000;

export const ONLINE_TIMEOUT_MS = 20 * ONE_MINUTE;
export const ONLINE_TIMEOUT_LABEL = "20 minutes";
export const MAX_PING_HISTORY = 50;
export const INSTALLATION_FIELDS =
  "ftpUsername cameraDetails lastPing pingHistory location createdAt";

export function getLastPingDate(lastPing) {
  if (!lastPing) {
    return null;
  }

  const date = new Date(lastPing);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isInstallationOnline(lastPing, now = Date.now()) {
  const lastPingDate = getLastPingDate(lastPing);

  return Boolean(
    lastPingDate && now - lastPingDate.getTime() < ONLINE_TIMEOUT_MS
  );
}

export function serializeInstallation(installation) {
  const lastPingDate = getLastPingDate(installation?.lastPing);

  return {
    id: installation?._id?.toString?.() || "",
    ftpUsername: installation?.ftpUsername || "",
    cameraDetails: Array.isArray(installation?.cameraDetails)
      ? installation.cameraDetails.map((camera) => ({
          name: typeof camera?.name === "string" ? camera.name : "",
          ip: typeof camera?.ip === "string" ? camera.ip : "",
          streamPath:
            typeof camera?.streamPath === "string" ? camera.streamPath : "",
        }))
      : [],
    lastPing: lastPingDate ? lastPingDate.toISOString() : null,
    pingHistory: Array.isArray(installation?.pingHistory)
      ? installation.pingHistory
          .map((entry) => {
            const timestamp = getLastPingDate(entry?.timestamp);

            if (!timestamp) {
              return null;
            }

            return {
              timestamp: timestamp.toISOString(),
              status: typeof entry?.status === "string" ? entry.status : "online",
              camCount: typeof entry?.camCount === "number" ? entry.camCount : 0,
            };
          })
          .filter(Boolean)
      : [],
    isOnline: isInstallationOnline(lastPingDate),
    location: installation?.location || "",
    createdAt: installation?.createdAt
      ? new Date(installation.createdAt).toISOString()
      : null,
  };
}
