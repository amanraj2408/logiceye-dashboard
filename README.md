# logiceye-dashboard

LogicEye VMS Installation Tracker built with Next.js 14, Tailwind CSS, MongoDB, and NextAuth.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/login`.

## Login

- Username: `admin`
- Password: `logiceye@2024`

## Environment variables

Create `.env.local` with:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```
