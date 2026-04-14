import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import connectToDatabase from "../../../lib/mongodb";
import { MAX_PING_HISTORY } from "../../../lib/installations";
import Installation from "../../../lib/models/Installation";
import { requireEnv } from "../../../lib/env";

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

  return cameraDetails.slice(0, 64).map((camera) => ({
    name: typeof camera?.name === "string" ? camera.name.trim().slice(0, 120) : "",
    ip: typeof camera?.ip === "string" ? camera.ip.trim().slice(0, 120) : "",
    streamPath:
      typeof camera?.streamPath === "string"
        ? camera.streamPath.trim().slice(0, 512)
        : "",
  }));
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function POST(request) {
  try {
    let pingApiKey = "";

    try {
      pingApiKey = requireEnv("PING_API_KEY");
    } catch (error) {
      console.error("[LogicEye Ping Config Error]", error);
      return NextResponse.json(
        { message: "Ping endpoint is not configured." },
        {
          status: 503,
          headers: corsHeaders(),
        }
      );
    }

    const body = await readJsonBody(request);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Request body must be valid JSON." },
        {
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    const requestApiKey = getPingApiKey(request, body);
    const ftpUsername =
      typeof body.ftpUsername === "string" ? body.ftpUsername.trim().slice(0, 120) : "";
    const passwordHash =
      typeof body.passwordHash === "string" ? body.passwordHash.trim().slice(0, 255) : "";
    const location =
      typeof body.location === "string" ? body.location.trim().slice(0, 200) : "";
    const cameraDetails = sanitizeCameraDetails(body?.cameraDetails);
    const now = new Date();

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
        receivedAt: now.toISOString(),
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

