import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectToDatabase from "../../../lib/mongodb";
import Installation from "../../../lib/models/Installation";

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

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const installations = await Installation.find({})
    .sort({ lastPing: -1, createdAt: -1 })
    .lean();

  return NextResponse.json({
    installations: installations.map(serializeInstallation),
  });
}
