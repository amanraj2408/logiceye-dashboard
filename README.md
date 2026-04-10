# logiceye-dashboard

LogicEye VMS Installation Tracker built with Next.js 14, Tailwind CSS, MongoDB, and NextAuth.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/login`.

## Login

Configure these in `.env.local`:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Environment variables

Create `.env.local` with:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
PING_API_KEY=your_secure_ping_api_key
```

## Ping authentication

Send the ping API key with one of these:

- `Authorization: Bearer <PING_API_KEY>`
- `X-Ping-Api-Key: <PING_API_KEY>`
- JSON body field: `apiKey`
