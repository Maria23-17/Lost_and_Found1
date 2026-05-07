import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export async function initDB() {
  db = await open({
    filename: path.join(__dirname, './database.sqlite'),
    driver: sqlite3.Database
  });

  // Таблица users
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      is_verified INTEGER DEFAULT 0,
      ban_reason TEXT,
      telegram_id TEXT,
      language TEXT DEFAULT 'ru',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `);

  // Добавляем колонки для users, если их нет
  const userColumns = await db.all("PRAGMA table_info(users)");
  const userColumnNames = userColumns.map(col => col.name);
  
  if (!userColumnNames.includes('telegram_id')) {
    await db.exec(`ALTER TABLE users ADD COLUMN telegram_id TEXT`);
    console.log("✅ Добавлена колонка telegram_id");
  }
  if (!userColumnNames.includes('language')) {
    await db.exec(`ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'ru'`);
    console.log("✅ Добавлена колонка language");
  }
  if (!userColumnNames.includes('phone')) {
    await db.exec(`ALTER TABLE users ADD COLUMN phone TEXT`);
    console.log("✅ Добавлена колонка phone");
  }

  // Таблица listings
  await db.exec(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT CHECK(type IN ('lost', 'found')) NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT,
      phone TEXT,
      image TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Добавляем колонки для listings, если их нет
  const listingsColumns = await db.all("PRAGMA table_info(listings)");
  const listingsColumnNames = listingsColumns.map(col => col.name);
  
  if (!listingsColumnNames.includes('updated_at')) {
    await db.exec(`ALTER TABLE listings ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
    console.log("✅ Добавлена колонка updated_at");
  }
  if (!listingsColumnNames.includes('status')) {
    await db.exec(`ALTER TABLE listings ADD COLUMN status TEXT DEFAULT 'pending'`);
    console.log("✅ Добавлена колонка status");
  }

  // Таблица reports
  await db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log("SQLite database initialized");
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call initDB() first.");
  }
  return db;
}