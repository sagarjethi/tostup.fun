import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Initialize SQLite database
// In production, this path might need to be configurable
const dbPath = path.resolve(__dirname, '../../tost_ai.db');

console.log(`Initializing Database at: ${dbPath}`);

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
