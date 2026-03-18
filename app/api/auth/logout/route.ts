import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("strava_access_token");
  cookieStore.delete("strava_refresh_token");
  cookieStore.delete("strava_expires_at");
  return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL!));
}
