import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { CLIENT_SCHEMA_SQL } from "./schema";
import type { ClientDbAdapter } from "./types";

const DB_NAME = "bfit_client";
let conn: SQLiteDBConnection | null = null;

async function getConn(): Promise<SQLiteDBConnection> {
  if (conn) return conn;

  const sqlite = new SQLiteConnection(CapacitorSQLite);
  await sqlite.checkConnectionsConsistency();

  const exists = await sqlite.isConnection(DB_NAME, false);
  if (exists.result) {
    conn = await sqlite.retrieveConnection(DB_NAME, false);
  } else {
    conn = await sqlite.createConnection(DB_NAME, false, "no-encryption", 1, false);
  }

  await conn.open();
  await conn.execute(CLIENT_SCHEMA_SQL);
  return conn;
}

export const nativeDriver: ClientDbAdapter = {
  async init() {
    await getConn();
  },

  async get(key) {
    const database = await getConn();
    const result = await database.query(
      `SELECT value FROM kv_store WHERE key = ? LIMIT 1`,
      [key]
    );
    return extractQueryValue(result.values?.[0]);
  },

  async set(key, value) {
    const database = await getConn();
    await database.run(
      `INSERT INTO kv_store (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, value, new Date().toISOString()]
    );
  },

  async remove(key) {
    const database = await getConn();
    await database.run(`DELETE FROM kv_store WHERE key = ?`, [key]);
  },

  async execute(sql) {
    const database = await getConn();
    await database.execute(sql);
  },

  async run(sql, params = []) {
    const database = await getConn();
    await database.run(sql, params);
  },

  async queryScalar(sql, params = []) {
    const database = await getConn();
    const result = await database.query(sql, params);
    return extractQueryValue(result.values?.[0]);
  },
};

function extractQueryValue(row: unknown): string | null {
  if (row == null) return null;
  if (Array.isArray(row)) {
    return row[0] != null ? String(row[0]) : null;
  }
  if (typeof row === "object") {
    const obj = row as Record<string, unknown>;
    const val = obj.value ?? Object.values(obj)[0];
    return val != null ? String(val) : null;
  }
  return String(row);
}