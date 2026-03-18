import { redirect } from "next/navigation";
import { fetchAllActivities } from "@/lib/strava";
import { computeStats, filterActivities, getThisWeek, getThisMonth, getThisYear } from "@/lib/stats";
import StatCard from "@/components/StatCard";
import ActivityList from "@/components/ActivityList";

export default async function DashboardPage() {
  let activities;
  try {
    activities = await fetchAllActivities();
  } catch {
    redirect("/");
  }

  const runs = filterActivities(activities, "Run");

  const allTimeStats = computeStats(runs);
  const yearStats = computeStats(getThisYear(runs));
  const monthStats = computeStats(getThisMonth(runs));
  const weekStats = computeStats(getThisWeek(runs));

  const recentRuns = [...runs]
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    .slice(0, 10);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Running stats</p>
      </div>

      {/* All time */}
      <section>
        <h2 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-3">All Time</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Runs" value={String(allTimeStats.totalActivities)} />
          <StatCard label="Total Distance" value={`${allTimeStats.totalDistanceKm} km`} />
          <StatCard label="Total Time" value={allTimeStats.totalMovingTime} />
          <StatCard label="Elevation" value={`${allTimeStats.totalElevationM} m`} />
          <StatCard label="Avg Distance" value={`${allTimeStats.avgDistanceKm} km`} />
          <StatCard label="Avg Pace" value={allTimeStats.avgPace} />
          {allTimeStats.avgHeartrate && (
            <StatCard label="Avg HR" value={`${allTimeStats.avgHeartrate} bpm`} />
          )}
          <StatCard label="Longest Run" value={`${allTimeStats.longestRunKm} km`} />
        </div>
      </section>

      {/* This year */}
      <section>
        <h2 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-3">
          This Year ({new Date().getFullYear()})
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Runs" value={String(yearStats.totalActivities)} />
          <StatCard label="Distance" value={`${yearStats.totalDistanceKm} km`} />
          <StatCard label="Time" value={yearStats.totalMovingTime} />
          <StatCard label="Avg Pace" value={yearStats.avgPace} />
        </div>
      </section>

      {/* This month */}
      <section>
        <h2 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-3">This Month</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Runs" value={String(monthStats.totalActivities)} />
          <StatCard label="Distance" value={`${monthStats.totalDistanceKm} km`} />
          <StatCard label="Time" value={monthStats.totalMovingTime} />
          <StatCard label="Avg Pace" value={monthStats.avgPace} />
        </div>
      </section>

      {/* This week */}
      <section>
        <h2 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-3">This Week</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Runs" value={String(weekStats.totalActivities)} />
          <StatCard label="Distance" value={`${weekStats.totalDistanceKm} km`} />
          <StatCard label="Time" value={weekStats.totalMovingTime} />
          <StatCard label="Avg Pace" value={weekStats.avgPace} />
        </div>
      </section>

      {/* Recent activities */}
      <section>
        <h2 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-3">Recent Runs</h2>
        <ActivityList activities={recentRuns} />
      </section>
    </main>
  );
}
