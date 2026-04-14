import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import connectToDatabase from "../../lib/mongodb";
import {
  INSTALLATION_FIELDS,
  serializeInstallation,
} from "../../lib/installations";
import Installation from "../../lib/models/Installation";
import DashboardClient from "../../components/DashboardClient";

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
