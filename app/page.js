import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "./api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/30">
        <h1 className="text-4xl font-semibold text-white">LogicEye Dashboard</h1>
        <p className="mt-4 text-slate-300">
          This is the LogicEye VMS installation tracker. Use the links below to sign in or open the dashboard.
        </p>

        {session ? (
          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
            <p className="text-green-200">You are already signed in as <strong>{session.user?.username || session.user?.name}</strong>.</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Open Dashboard
            </Link>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-6">
            <p className="text-sky-200">You must sign in to access dashboard data.</p>
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
