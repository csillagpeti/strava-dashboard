import { NextResponse } from "next/server";
import { fetchAllActivities } from "@/lib/strava";

export async function GET() {
  try {
    const activities = await fetchAllActivities();
    return NextResponse.json(activities);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
