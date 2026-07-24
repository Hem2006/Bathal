import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'tierlist.db');

const SQL = await initSqlJs();

let db;
if (existsSync(DB_PATH)) {
  const buffer = readFileSync(DB_PATH);
  db = new SQL.Database(buffer);
} else {
  db = new SQL.Database();
}

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_path TEXT NOT NULL,
    caption TEXT,
    added_by TEXT,
    tier TEXT NOT NULL DEFAULT 'UNRANKED',
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);
save();

export function save() {
  const data = db.export();
  writeFileSync(DB_PATH, Buffer.from(data));
}

export default db;
