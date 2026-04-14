function readEnv(name) {
  const value = process.env[name];

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function requireEnv(name) {
  const value = readEnv(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getRuntimeConfig() {
  return {
    mongodbUri: requireEnv("MONGODB_URI"),
    nextAuthSecret: requireEnv("NEXTAUTH_SECRET"),
    adminUsername: requireEnv("ADMIN_USERNAME"),
    adminPassword: requireEnv("ADMIN_PASSWORD"),
    pingApiKey: requireEnv("PING_API_KEY"),
    nextAuthUrl: readEnv("NEXTAUTH_URL"),
  };
}
