import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import connectToDatabase from "../../lib/mongodb";
import Installation from "../../lib/models/Installation";
import DashboardClient from "../../components/DashboardClient";

const ONE_MINUTE = 60 * 1000;
const INSTALLATION_FIELDS =
  "ftpUsername cameraDetails lastPing pingHistory location";

function serializeInstallation(installation) {
  const lastPingDate = installation.lastPing ? new Date(installation.lastPing) : null;
  const isOnline = Boolean(
    lastPingDate && Date.now() - lastPingDate.getTime() < ONE_MINUTE
  );

  return {
    id: installation._id.toString(),
    ftpUsername: installation.ftpUsername,
    cameraDetails: Array.isArray(installation.cameraDetails)
      ? installation.cameraDetails
      : [],
    lastPing: lastPingDate ? lastPingDate.toISOString() : null,
    pingHistory: Array.isArray(installation.pingHistory)
      ? installation.pingHistory
          .map((entry) => ({
            timestamp: entry?.timestamp
              ? new Date(entry.timestamp).toISOString()
              : null,
            status: typeof entry?.status === "string" ? entry.status : "online",
            camCount: typeof entry?.camCount === "number" ? entry.camCount : 0,
          }))
          .filter((entry) => entry.timestamp)
      : [],
    isOnline,
    location: installation.location || "",
    createdAt: installation.createdAt
      ? new Date(installation.createdAt).toISOString()
      : null,
  };
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  let installations = [];
  let dataError = "";

  try {
    await connectToDatabase();

    installations = await Installation.find({})
      .select(INSTALLATION_FIELDS)
      .sort({ lastPing: -1, createdAt: -1 })
      .lean();
  } catch (error) {
    console.error("[Dashboard Page Error]", error);
    dataError =
      "Dashboard data is temporarily unavailable. Check MongoDB and Vercel environment settings.";
  }

  return (
    <DashboardClient
      initialInstallations={installations.map(serializeInstallation)}
      dataError={dataError}
    />
  );
}
