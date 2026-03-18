import { StravaActivity } from "./strava";

export type SportFilter = "Run" | "Ride" | "All";

export function filterActivities(activities: StravaActivity[], sport: SportFilter) {
  if (sport === "All") return activities;
  return activities.filter((a) => a.sport_type === sport || a.type === sport);
}

function metersToKm(m: number) {
  return m / 1000;
}

function secondsToDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function paceFromSpeed(speedMs: number) {
  if (speedMs === 0) return "–";
  const secPerKm = 1000 / speedMs;
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
}

export interface Stats {
  totalActivities: number;
  totalDistanceKm: number;
  totalMovingTime: string;
  totalElevationM: number;
  avgDistanceKm: number;
  avgPace: string;
  avgHeartrate: number | null;
  longestRunKm: number;
}

export function computeStats(activities: StravaActivity[]): Stats {
  if (activities.length === 0) {
    return {
      totalActivities: 0,
      totalDistanceKm: 0,
      totalMovingTime: "0m",
      totalElevationM: 0,
      avgDistanceKm: 0,
      avgPace: "–",
      avgHeartrate: null,
      longestRunKm: 0,
    };
  }

  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0);
  const totalTime = activities.reduce((sum, a) => sum + a.moving_time, 0);
  const totalElevation = activities.reduce((sum, a) => sum + a.total_elevation_gain, 0);
  const totalSpeed = activities.reduce((sum, a) => sum + a.average_speed, 0);
  const longest = Math.max(...activities.map((a) => a.distance));

  const hrActivities = activities.filter((a) => a.average_heartrate);
  const avgHr =
    hrActivities.length > 0
      ? Math.round(hrActivities.reduce((sum, a) => sum + (a.average_heartrate ?? 0), 0) / hrActivities.length)
      : null;

  return {
    totalActivities: activities.length,
    totalDistanceKm: Math.round(metersToKm(totalDistance)),
    totalMovingTime: secondsToDuration(totalTime),
    totalElevationM: Math.round(totalElevation),
    avgDistanceKm: Math.round(metersToKm(totalDistance / activities.length) * 10) / 10,
    avgPace: paceFromSpeed(totalSpeed / activities.length),
    avgHeartrate: avgHr,
    longestRunKm: Math.round(metersToKm(longest) * 10) / 10,
  };
}

export function getThisYear(activities: StravaActivity[]) {
  const year = new Date().getFullYear();
  return activities.filter((a) => new Date(a.start_date).getFullYear() === year);
}

export function getThisMonth(activities: StravaActivity[]) {
  const now = new Date();
  return activities.filter((a) => {
    const d = new Date(a.start_date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
}

export function getThisWeek(activities: StravaActivity[]) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);
  return activities.filter((a) => new Date(a.start_date) >= startOfWeek);
}
