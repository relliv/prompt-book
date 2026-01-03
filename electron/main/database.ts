import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import * as schema from '@app/shared/models';

let db: ReturnType<typeof drizzle> | null = null;
let sqlite: Database.Database | null = null;

export const getDatabase = () => {
  if (db) return db;

  // Get the user data directory for storing the database
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'prompt-book.db');

  // Ensure the directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  console.log('[Database] Initializing database at:', dbPath);

  // Create SQLite database connection
  sqlite = new Database(dbPath);

  // Enable WAL mode for better performance
  sqlite.pragma('journal_mode = WAL');

  // Create Drizzle ORM instance
  db = drizzle(sqlite, { schema });

  // Run migrations / create tables
  initializeTables();

  console.log('[Database] Database initialized successfully');

  return db;
};

const initializeTables = () => {
  if (!sqlite) return;

  // Create projects table if it doesn't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT '📁',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
      last_opened_at INTEGER
    )
  `);

  // Add last_opened_at column if it doesn't exist (migration for existing databases)
  try {
    sqlite.exec(`ALTER TABLE projects ADD COLUMN last_opened_at INTEGER`);
  } catch {
    // Column already exists, ignore error
  }

  // Create project_prompts table if it doesn't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS project_prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      prompt TEXT NOT NULL,
      copy_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // Create project_features table if it doesn't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS project_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      copy_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  console.log('[Database] Tables initialized');
};

export const closeDatabase = () => {
  if (sqlite) {
    sqlite.close();
    sqlite = null;
    db = null;
    console.log('[Database] Database connection closed');
  }
};
