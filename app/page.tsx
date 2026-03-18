import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("strava_access_token");
  if (token) redirect("/dashboard");

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Strava Dashboard</h1>
          <p className="text-gray-400 mt-2">Your personal stats and trends</p>
        </div>
        <Link
          href="/api/auth/login"
          className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Connect with Strava
        </Link>
      </div>
    </main>
  );
}
