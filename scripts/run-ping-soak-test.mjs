import fs from "node:fs";
import path from "node:path";

function parseEnvLocal(projectRoot) {
  const envPath = path.join(projectRoot, ".env.local");
  const values = {};

  if (!fs.existsSync(envPath)) {
    return values;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const eqIndex = line.indexOf("=");
    if (eqIndex < 1) {
      continue;
    }

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function parseArgs(argv) {
  const options = {
    durationHours: 4,
    intervalMinutes: 15,
    ftpUsername: "final-test",
    location: "Final test",
    cameraCount: 2,
    baseUrl: "http://localhost:3000",
    iterations: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--hours" && next) {
      options.durationHours = Number(next);
      i += 1;
    } else if (arg === "--interval" && next) {
      options.intervalMinutes = Number(next);
      i += 1;
    } else if (arg === "--ftp" && next) {
      options.ftpUsername = next;
      i += 1;
    } else if (arg === "--location" && next) {
      options.location = next;
      i += 1;
    } else if (arg === "--camera-count" && next) {
      options.cameraCount = Number(next);
      i += 1;
    } else if (arg === "--base-url" && next) {
      options.baseUrl = next;
      i += 1;
    } else if (arg === "--iterations" && next) {
      options.iterations = Number(next);
      i += 1;
    }
  }

  return options;
}

function buildCameraDetails(cameraCount) {
  const count = Number.isFinite(cameraCount) && cameraCount > 0 ? Math.floor(cameraCount) : 1;

  return Array.from({ length: count }, (_, index) => {
    const cameraNo = index + 1;
    return {
      name: `Camera ${cameraNo}`,
      ip: `192.168.1.${100 + cameraNo}`,
      streamPath: `/stream/cam-${cameraNo}`,
    };
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendPing({ baseUrl, pingApiKey, ftpUsername, location, cameraDetails, attempt, total }) {
  const endpoint = `${baseUrl.replace(/\/$/, "")}/api/ping`;
  const passwordHash = `test-hash-${ftpUsername}`;

  process.stdout.write(
    `[${new Date().toISOString()}] Sending ping ${attempt}/${total} to ${endpoint} for ${ftpUsername}\n`
  );

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pingApiKey}`,
    },
    body: JSON.stringify({
      ftpUsername,
      passwordHash,
      location,
      cameraDetails,
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Ping failed (${response.status}): ${text}`);
  }

  process.stdout.write(`[${new Date().toISOString()}] Ping accepted: ${text}\n`);
}

async function main() {
  const projectRoot = process.cwd();
  const envLocalValues = parseEnvLocal(projectRoot);
  const options = parseArgs(process.argv.slice(2));

  const pingApiKey = process.env.PING_API_KEY || envLocalValues.PING_API_KEY;
  if (!pingApiKey) {
    throw new Error(
      "Missing PING_API_KEY. Add it to .env.local or set it in your shell before running this script."
    );
  }

  const baseUrl = options.baseUrl || process.env.NEXTAUTH_URL || envLocalValues.NEXTAUTH_URL || "http://localhost:3000";
  const cameraDetails = buildCameraDetails(options.cameraCount);
  const intervalMs = Math.max(1, Math.floor(options.intervalMinutes * 60 * 1000));

  const computedIterations = Math.max(1, Math.ceil((options.durationHours * 60) / options.intervalMinutes));
  const totalIterations = Number.isFinite(options.iterations) && options.iterations > 0
    ? Math.floor(options.iterations)
    : computedIterations;

  process.stdout.write(
    `Starting soak test: ftp=${options.ftpUsername}, total=${totalIterations}, interval=${options.intervalMinutes}m, hours=${options.durationHours}, base=${baseUrl}\n`
  );

  for (let attempt = 1; attempt <= totalIterations; attempt += 1) {
    await sendPing({
      baseUrl,
      pingApiKey,
      ftpUsername: options.ftpUsername,
      location: options.location,
      cameraDetails,
      attempt,
      total: totalIterations,
    });

    if (attempt < totalIterations) {
      process.stdout.write(
        `[${new Date().toISOString()}] Waiting ${options.intervalMinutes} minute(s) before next ping...\n`
      );
      await delay(intervalMs);
    }
  }

  process.stdout.write(`[${new Date().toISOString()}] Soak test completed successfully.\n`);
}

main().catch((error) => {
  console.error(`[${new Date().toISOString()}] Soak test failed:`, error.message);
  process.exitCode = 1;
});
