"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import { StravaActivity } from "@/lib/strava";

function monthlyDistanceData(activities: StravaActivity[]) {
  const now = new Date();
  const months: { label: string; key: string; km: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    months.push({ label, key, km: 0 });
  }

  for (const a of activities) {
    const d = new Date(a.start_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const month = months.find((m) => m.key === key);
    if (month) month.km += a.distance / 1000;
  }

  return months.map((m) => ({ ...m, km: Math.round(m.km * 10) / 10 }));
}

function paceTrendData(activities: StravaActivity[]) {
  return [...activities]
    .filter((a) => a.average_speed > 0)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(-60)
    .map((a) => {
      const secPerKm = 1000 / a.average_speed;
      const minPerKm = secPerKm / 60;
      const date = new Date(a.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      return { date, pace: Math.round(minPerKm * 100) / 100, name: a.name };
    });
}

function formatPaceTick(value: number) {
  const m = Math.floor(value);
  const s = Math.round((value - m) * 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #374151",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "12px",
};

export default function Charts({ activities }: { activities: StravaActivity[] }) {
  if (activities.length === 0) return null;

  const monthlyData = monthlyDistanceData(activities);
  const paceData = paceTrendData(activities);

  const paceValues = paceData.map((d) => d.pace);
  const paceMin = Math.max(0, Math.min(...paceValues) - 0.3);
  const paceMax = Math.max(...paceValues) + 0.3;

  return (
    <div className="space-y-6">
      {/* Monthly distance */}
      <section>
        <h2 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">
          Monthly Distance (km)
        </h2>
        <div className="bg-gray-900 rounded-xl p-4">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`${v} km`, "Distance"]}
              />
              <Bar dataKey="km" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Pace trend */}
      {paceData.length > 2 && (
        <section>
          <h2 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">
            Pace Trend — last {paceData.length} activities (min/km)
          </h2>
          <div className="bg-gray-900 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={paceData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9ca3af", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[paceMin, paceMax]}
                  reversed
                  tickFormatter={formatPaceTick}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [formatPaceTick(Number(v)) + " /km", "Pace"]}
                  labelFormatter={(label) => label}
                />
                <Line
                  type="monotone"
                  dataKey="pace"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: "#f97316", r: 2 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-gray-600 text-xs mt-1">Lower = faster</p>
          </div>
        </section>
      )}
    </div>
  );
}
