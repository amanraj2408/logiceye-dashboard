import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectToDatabase from "../../../lib/mongodb";
import Installation from "../../../lib/models/Installation";

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

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const installations = await Installation.find({})
      .select(INSTALLATION_FIELDS)
      .sort({ lastPing: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      installations: installations.map(serializeInstallation),
    });
  } catch (error) {
    console.error("[Installations API Error]", error);

    return NextResponse.json(
      {
        installations: [],
        message: "Unable to load installations right now.",
      },
      { status: 500 }
    );
  }
}
