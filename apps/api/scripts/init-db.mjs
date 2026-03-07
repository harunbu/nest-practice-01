import 'dotenv/config';
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

function resolveDatabasePath(databaseUrl) {
  if (!databaseUrl.startsWith('file:')) {
    throw new Error('Only file: DATABASE_URL values are supported.');
  }

  const relativePath = databaseUrl.slice('file:'.length);
  const prismaDir = resolve(import.meta.dirname, '../prisma');

  return resolve(prismaDir, relativePath);
}

const databaseUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const databasePath = resolveDatabasePath(databaseUrl);

mkdirSync(dirname(databasePath), { recursive: true });

const db = new Database(databasePath);

db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS "NoteTag" (
    "noteId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    PRIMARY KEY ("noteId", "tagId"),
    FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE INDEX IF NOT EXISTS "Note_userId_idx" ON "Note" ("userId");
  CREATE INDEX IF NOT EXISTS "NoteTag_tagId_idx" ON "NoteTag" ("tagId");
`);

db.close();

console.log(`Initialized SQLite database at ${databasePath}`);
