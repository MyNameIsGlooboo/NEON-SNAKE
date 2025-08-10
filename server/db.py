import sqlite3
import os
import datetime
from typing import List, Dict, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), 'scores.db')

def init_db() -> None:
    "Create the scores table if it does not exist."
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            score INTEGER NOT NULL,
            ts TEXT NOT NULL
        )
        """)
        conn.commit()
    finally:
        conn.close()

def add_score(name: Optional[str], score: int, ts: str) -> Dict:
    "Insert a score and return the stored row as a dict."
    conn = sqlite3.connect(DB_PATH)
    try:
        cur = conn.cursor()
        cur.execute("INSERT INTO scores (name, score, ts) VALUES (?, ?, ?)", (name, score, ts))
        conn.commit()
        return {"id": cur.lastrowid, "name": name, "score": score, "ts": ts}
    finally:
        conn.close()

def get_scores(limit: int = 50) -> List[Dict]:
    "Return a list of top scores ordered by score desc then ts asc."
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        cur = conn.cursor()
        cur.execute("SELECT name, score, ts FROM scores ORDER BY score DESC, ts ASC LIMIT ?", (limit,))
        rows = cur.fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
