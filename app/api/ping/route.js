import { NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import Installation from "../../../lib/models/Installation";

const TWENTY_MINUTES = 20 * 60 * 1000;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function sanitizeCameraDetails(cameraDetails) {
  if (!Array.isArray(cameraDetails)) {
    return [];
  }

  return cameraDetails.map((camera) => ({
    name: typeof camera?.name === "string" ? camera.name : "",
    ip: typeof camera?.ip === "string" ? camera.ip : "",
    streamPath: typeof camera?.streamPath === "string" ? camera.streamPath : "",
  }));
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const ftpUsername =
      typeof body?.ftpUsername === "string" ? body.ftpUsername.trim() : "";
    const passwordHash =
      typeof body?.passwordHash === "string" ? body.passwordHash : "";
    const location = typeof body?.location === "string" ? body.location.trim() : "";
    const cameraDetails = sanitizeCameraDetails(body?.cameraDetails);
    const now = new Date();

    console.log(
      `[LogicEye Ping] ${now.toISOString()} ftpUsername=${
        ftpUsername || "unknown"
      } cameras=${cameraDetails.length}`
    );

    if (!ftpUsername || !passwordHash) {
      return NextResponse.json(
        { message: "ftpUsername and passwordHash are required." },
        {
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    await connectToDatabase();

    const installation = await Installation.findOneAndUpdate(
      { ftpUsername },
      {
        ftpUsername,
        cameraDetails,
        passwordHash,
        lastPing: now,
        isOnline: Date.now() - now.getTime() < TWENTY_MINUTES,
        ...(location ? { location } : {}),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json(
      {
        message: "Ping received successfully.",
        installationId: installation.ftpUsername,
      },
      {
        status: 200,
        headers: corsHeaders(),
      }
    );
  } catch (error) {
    console.error("[LogicEye Ping Error]", error);

    return NextResponse.json(
      { message: "Failed to process ping." },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}

