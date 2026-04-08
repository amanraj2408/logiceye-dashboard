import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import connectToDatabase from "../../lib/mongodb";
import Installation from "../../lib/models/Installation";
import DashboardClient from "../../components/DashboardClient";

const TWENTY_MINUTES = 20 * 60 * 1000;

function serializeInstallation(installation) {
  const lastPingDate = installation.lastPing ? new Date(installation.lastPing) : null;
  const isOnline = Boolean(
    lastPingDate && Date.now() - lastPingDate.getTime() < TWENTY_MINUTES
  );

  return {
    id: installation._id.toString(),
    ftpUsername: installation.ftpUsername,
    cameraDetails: Array.isArray(installation.cameraDetails)
      ? installation.cameraDetails
      : [],
    passwordHash: installation.passwordHash,
    lastPing: lastPingDate ? lastPingDate.toISOString() : null,
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
