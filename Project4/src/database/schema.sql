-- DecodeLabs Industrial Training — Project 4: Frontend & Backend Integration
-- Schema Definition: Interns Table & Indexes

CREATE TABLE IF NOT EXISTS interns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL CHECK(length(trim(name)) >= 2),
  role TEXT NOT NULL CHECK(length(trim(role)) >= 2),
  email TEXT UNIQUE NOT NULL CHECK(email LIKE '%_@__%.__%'),
  track TEXT NOT NULL CHECK(track IN (
    'Full Stack Development',
    'Frontend Engineering',
    'Backend Engineering',
    'Cloud & AI'
  )),
  status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Graduated', 'On Leave')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_interns_track ON interns(track);
CREATE INDEX IF NOT EXISTS idx_interns_status ON interns(status);
CREATE INDEX IF NOT EXISTS idx_interns_email ON interns(email);
