import initSqlJs, { type Database, type SqlValue } from "sql.js";
import { CLIENT_SCHEMA_SQL } from "./schema";
import { loadSqliteBlob, saveSqliteBlob } from "./idb";
import type { ClientDbAdapter } from "./types";

let db: Database | null = null;
let initPromise: Promise<Database> | null = null;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

async function getDb(): Promise<Database> {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
    const saved = await loadSqliteBlob();
    const database = saved ? new SQL.Database(saved) : new SQL.Database();
    database.run(CLIENT_SCHEMA_SQL);
    db = database;
    return database;
  })();

  return initPromise;
}

function schedulePersist() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    void (async () => {
      if (!db) return;
      await saveSqliteBlob(db.export());
    })();
  }, 300);
}

export const webDriver: ClientDbAdapter = {
  async init() {
    await getDb();
  },

  async get(key) {
    const database = await getDb();
    const stmt = database.prepare(`SELECT value FROM kv_store WHERE key = ?`);
    stmt.bind([key]);
    if (stmt.step()) {
      const row = stmt.getAsObject() as { value?: string };
      stmt.free();
      return row.value ?? null;
    }
    stmt.free();
    return null;
  },

  async set(key, value) {
    const database = await getDb();
    database.run(
      `INSERT INTO kv_store (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, value, new Date().toISOString()]
    );
    schedulePersist();
  },

  async remove(key) {
    const database = await getDb();
    database.run(`DELETE FROM kv_store WHERE key = ?`, [key]);
    schedulePersist();
  },

  async execute(sql) {
    const database = await getDb();
    database.run(sql);
    schedulePersist();
  },

  async run(sql, params: SqlValue[] = []) {
    const database = await getDb();
    database.run(sql, params);
    schedulePersist();
  },

  async queryScalar(sql, params: SqlValue[] = []) {
    const database = await getDb();
    const stmt = database.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject() as Record<string, string | number>;
      stmt.free();
      const val = Object.values(row)[0];
      return val != null ? String(val) : null;
    }
    stmt.free();
    return null;
  },
};