# logiceye-dashboard

LogicEye VMS Installation Tracker built with Next.js 14, Tailwind CSS, MongoDB, and NextAuth credentials auth.

## Features

- Protected dashboard for LogicEye admins
- Ping ingestion API for VMS heartbeat updates
- Installation detail view with recent ping history
- Shared 20-minute online timeout across server render and API refreshes

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/login`.

## Required environment variables

Create `.env.local` with:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_long_random_secret
NEXTAUTH_URL=http://localhost:3000
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
PING_API_KEY=your_secure_ping_api_key
```

The app will return clear runtime errors if any required value is missing.

## Production checklist

- Set all required environment variables in Vercel
- Set `NEXTAUTH_URL` to your production domain
- Use a strong `NEXTAUTH_SECRET`
- Use a long random `PING_API_KEY`
- Point `MONGODB_URI` at a production MongoDB cluster
- Verify the client that sends `/api/ping` continues sending heartbeats after deployment

## Ping API

`POST /api/ping`

Accepted authentication methods:

- `Authorization: Bearer <PING_API_KEY>`
- `X-Ping-Api-Key: <PING_API_KEY>`
- JSON body field `apiKey`

Required JSON body fields:

```json
{
  "ftpUsername": "site-001",
  "passwordHash": "pre-hashed-value",
  "location": "Client HQ",
  "cameraDetails": [
    {
      "name": "Camera 1",
      "ip": "192.168.1.101",
      "streamPath": "/stream/cam-1"
    }
  ]
}
```

## Smoke checks

```bash
npm run lint
npm run build
```
