import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectToDatabase from "../../../lib/mongodb";
import Installation from "../../../lib/models/Installation";
import {
  INSTALLATION_FIELDS,
  serializeInstallation,
} from "../../../lib/installations";

export const dynamic = "force-dynamic";

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
      onlineTimeoutMinutes: 20,
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
