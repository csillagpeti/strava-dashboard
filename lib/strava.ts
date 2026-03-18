import { cookies } from "next/headers";

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  start_date: string;
  distance: number;       // meters
  moving_time: number;    // seconds
  elapsed_time: number;   // seconds
  total_elevation_gain: number;
  average_speed: number;  // m/s
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  suffer_score?: number;
  map?: { summary_polyline: string };
}

async function refreshTokenIfNeeded(accessToken: string, expiresAt: number, refreshToken: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (expiresAt > now + 60) return accessToken;

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) throw new Error("Failed to refresh token");

  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set("strava_access_token", data.access_token, { httpOnly: true, path: "/" });
  cookieStore.set("strava_expires_at", String(data.expires_at), { httpOnly: true, path: "/" });

  return data.access_token;
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("strava_access_token")?.value;
  const refreshToken = cookieStore.get("strava_refresh_token")?.value;
  const expiresAt = Number(cookieStore.get("strava_expires_at")?.value ?? 0);

  if (!accessToken || !refreshToken) return null;

  return refreshTokenIfNeeded(accessToken, expiresAt, refreshToken);
}

export async function fetchAllActivities(): Promise<StravaActivity[]> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const allActivities: StravaActivity[] = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=${page}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) throw new Error(`Strava API error: ${res.status}`);

    const activities: StravaActivity[] = await res.json();
    allActivities.push(...activities);

    if (activities.length < perPage) break;
    page++;
  }

  return allActivities;
}
