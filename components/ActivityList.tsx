import { StravaActivity } from "@/lib/strava";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatKm(meters: number) {
  return (meters / 1000).toFixed(2) + " km";
}

function formatPace(speedMs: number) {
  if (speedMs === 0) return "–";
  const secPerKm = 1000 / speedMs;
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface Props {
  activities: StravaActivity[];
}

export default function ActivityList({ activities }: Props) {
  if (activities.length === 0) {
    return <p className="text-gray-500 text-sm">No activities found.</p>;
  }

  return (
    <div className="space-y-2">
      {activities.map((a) => (
        <div key={a.id} className="bg-gray-900 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white font-medium text-sm">{a.name}</p>
              <p className="text-gray-500 text-xs mt-0.5">{formatDate(a.start_date)}</p>
            </div>
            <span className="text-orange-400 font-bold text-sm">{formatKm(a.distance)}</span>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span>{formatDuration(a.moving_time)}</span>
            <span>{formatPace(a.average_speed)}</span>
            {a.average_heartrate && <span>{Math.round(a.average_heartrate)} bpm</span>}
            {a.total_elevation_gain > 0 && <span>↑{Math.round(a.total_elevation_gain)}m</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
