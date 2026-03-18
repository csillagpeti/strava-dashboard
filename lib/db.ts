import Dexie, { Table } from "dexie";
import { StravaActivity } from "./strava";

interface SyncMeta {
  id: string;
  lastSynced: number;
}

class StravaDB extends Dexie {
  activities!: Table<StravaActivity>;
  meta!: Table<SyncMeta>;

  constructor() {
    super("strava-dashboard");
    this.version(1).stores({
      activities: "id, type, sport_type, start_date",
      meta: "id",
    });
  }
}

export const db = new StravaDB();

export async function getCachedActivities(): Promise<StravaActivity[] | null> {
  const meta = await db.meta.get("sync");
  if (!meta) return null;
  const ageMinutes = (Date.now() - meta.lastSynced) / 1000 / 60;
  if (ageMinutes > 60) return null;
  return db.activities.toArray();
}

export async function cacheActivities(activities: StravaActivity[]) {
  await db.activities.clear();
  await db.activities.bulkPut(activities);
  await db.meta.put({ id: "sync", lastSynced: Date.now() });
}

export async function getLastSynced(): Promise<number | null> {
  const meta = await db.meta.get("sync");
  return meta?.lastSynced ?? null;
}
