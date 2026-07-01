import { NextResponse } from "next/server";
import { getServerDb, getServerDbPath } from "@/lib/db/server/connection";
import { resolveDbDriver } from "@/lib/store";

export async function GET() {
  try {
    const driver = resolveDbDriver();

    if (driver !== "sqlite") {
      return NextResponse.json({
        ok: true,
        driver,
        sqlite: null,
      });
    }

    const db = getServerDb();
    const users = db
      .prepare("SELECT COUNT(*) AS count FROM user_sessions")
      .get() as { count: number };
    const wellnessLogs = db
      .prepare("SELECT COUNT(*) AS count FROM wellness_daily_logs")
      .get() as { count: number };
    const wellnessUsers = db
      .prepare("SELECT COUNT(DISTINCT phone) AS count FROM wellness_daily_logs")
      .get() as { count: number };

    return NextResponse.json({
      ok: true,
      driver,
      sqlite: {
        path: getServerDbPath(),
        userCount: users.count,
        wellnessLogCount: wellnessLogs.count,
        wellnessUserCount: wellnessUsers.count,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Database health check failed",
      },
      { status: 500 }
    );
  }
}