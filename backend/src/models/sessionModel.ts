export interface Session {
  id: number;
  sessionId: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const SESSION_TABLE = "sessions";

export const createSessionsTableSQL = `
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;
