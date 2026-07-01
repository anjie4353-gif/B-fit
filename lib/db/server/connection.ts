import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { SERVER_SCHEMA_SQL } from "./schema";
import { migrateFromJsonFile } from "./migrate-from-json";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "bfit.db");

let db: Database.Database | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getServerDb(): Database.Database {
  if (db) return db;

  ensureDataDir();
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SERVER_SCHEMA_SQL);
  migrateFromJsonFile(db);

  return db;
}

export function closeServerDb() {
  if (db) {
    db.close();
    db = null;
  }
}

export function getServerDbPath() {
  return DB_PATH;
}