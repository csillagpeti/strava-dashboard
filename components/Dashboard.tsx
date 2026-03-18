"use client";

import { useEffect, useState } from "react";
import { StravaActivity } from "@/lib/strava";
import { db, cacheActivities, getCachedActivities, getLastSynced } from "@/lib/db";
import { computeStats, filterActivities, getThisWeek, getThisMonth, getThisYear } from "@/lib/stats";
import StatCard from "./StatCard";
import ActivityList from "./ActivityList";
import Charts from "./Charts";

type SportFilter = "Run" | "Ride" | "All";

function timeAgo(ts: number) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Dashboard() {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<number | null>(null);
  const [sport, setSport] = useState<SportFilter>("Run");

  async function syncActivities(force = false) {
    setLoading(true);
    setError(null);

    if (!force) {
      const cached = await getCachedActivities();
      if (cached) {
        setActivities(cached);
        const ts = await getLastSynced();
        setLastSynced(ts);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/activities");
      if (res.status === 401) {
        window.location.href = "/";
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data: StravaActivity[] = await res.json();
      await cacheActivities(data);
      setActivities(data);
      const ts = await getLastSynced();
      setLastSynced(ts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    syncActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Syncing your activities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
        <p className="text-red-400">Error: {error}</p>
        <button
          onClick={() => syncActivities(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const filtered = filterActivities(activities, sport);
  const allTimeStats = computeStats(filtered);
  const yearStats = computeStats(getThisYear(filtered));
  const monthStats = computeStats(getThisMonth(filtered));
  const weekStats = computeStats(getThisWeek(filtered));
  const recentRuns = [...filtered]
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    .slice(0, 10);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          {lastSynced && (
            <p className="text-gray-500 text-xs mt-0.5">Synced {timeAgo(lastSynced)}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => syncActivities(true)}
            className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            Refresh
          </button>
          <a
            href="/api/auth/logout"
            className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            Logout
          </a>
        </div>
      </div>

      {/* Sport filter */}
      <div className="flex gap-2">
        {(["Run", "Ride", "All"] as SportFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setSport(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              sport === s
                ? "bg-orange-500 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {s === "Run" ? "Running" : s === "Ride" ? "Cycling" : "All"}
          </button>
        ))}
      </div>

      {/* All time */}
      <section>
        <h2 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">All Time</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Activities" value={String(allTimeStats.totalActivities)} />
          <StatCard label="Total Distance" value={`${allTimeStats.totalDistanceKm} km`} />
          <StatCard label="Total Time" value={allTimeStats.totalMovingTime} />
          <StatCard label="Elevation" value={`${allTimeStats.totalElevationM} m`} />
          <StatCard label="Avg Distance" value={`${allTimeStats.avgDistanceKm} km`} />
          <StatCard label="Avg Pace" value={allTimeStats.avgPace} />
          {allTimeStats.avgHeartrate && (
            <StatCard label="Avg HR" value={`${allTimeStats.avgHeartrate} bpm`} />
          )}
          <StatCard label="Longest" value={`${allTimeStats.longestRunKm} km`} />
        </div>
      </section>

      {/* Charts */}
      <Charts activities={filtered} />

      {/* This year */}
      <section>
        <h2 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">
          {new Date().getFullYear()}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Activities" value={String(yearStats.totalActivities)} />
          <StatCard label="Distance" value={`${yearStats.totalDistanceKm} km`} />
          <StatCard label="Time" value={yearStats.totalMovingTime} />
          <StatCard label="Avg Pace" value={yearStats.avgPace} />
        </div>
      </section>

      {/* This month */}
      <section>
        <h2 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">This Month</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Activities" value={String(monthStats.totalActivities)} />
          <StatCard label="Distance" value={`${monthStats.totalDistanceKm} km`} />
          <StatCard label="Time" value={monthStats.totalMovingTime} />
          <StatCard label="Avg Pace" value={monthStats.avgPace} />
        </div>
      </section>

      {/* This week */}
      <section>
        <h2 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">This Week</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Activities" value={String(weekStats.totalActivities)} />
          <StatCard label="Distance" value={`${weekStats.totalDistanceKm} km`} />
          <StatCard label="Time" value={weekStats.totalMovingTime} />
          <StatCard label="Avg Pace" value={weekStats.avgPace} />
        </div>
      </section>

      {/* Recent */}
      <section>
        <h2 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">Recent</h2>
        <ActivityList activities={recentRuns} />
      </section>
    </main>
  );
}
