import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import connectToDatabase from "../../../lib/mongodb";
import Installation from "../../../lib/models/Installation";

const MAX_PING_HISTORY = 50;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Ping-Api-Key",
  };
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getPingApiKey(request, body) {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return (
    request.headers.get("x-ping-api-key") ||
    (typeof body?.apiKey === "string" ? body.apiKey.trim() : "")
  );
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
    const pingApiKey = process.env.PING_API_KEY;

    if (!pingApiKey) {
      console.error("[LogicEye Ping Error] PING_API_KEY is not configured.");
      return NextResponse.json(
        { message: "Ping endpoint is not configured." },
        {
          status: 503,
          headers: corsHeaders(),
        }
      );
    }

    const body = await request.json();
    const requestApiKey = getPingApiKey(request, body);
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

    if (!requestApiKey || !safeEqual(requestApiKey, pingApiKey)) {
      return NextResponse.json(
        { message: "Unauthorized ping request." },
        {
          status: 401,
          headers: corsHeaders(),
        }
      );
    }

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
        $set: {
          ftpUsername,
          cameraDetails,
          passwordHash,
          lastPing: now,
          isOnline: true,
          ...(location ? { location } : {}),
        },
        $push: {
          pingHistory: {
            $each: [
              {
                timestamp: now,
                status: "online",
                camCount: cameraDetails.length,
              },
            ],
            $slice: -MAX_PING_HISTORY,
          },
        },
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

