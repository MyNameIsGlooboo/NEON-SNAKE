"""
Flask backend for Neon Snake scoreboard (step 2).

- Serves static files (snake_game.html, snake_game.css, snake_game.js) from the repository root.
- Provides a simple SQLite-backed JSON API:
    GET  /api/scores      -> returns top N scores (query param: ?limit=10)
    POST /api/scores      -> accepts JSON { "name"?: string, "score": int } and stores a new score

The app will create the SQLite database file `scores.db` and the scores table on first run
(if they don't already exist), so a separate DB initializer is optional.
"""
from pathlib import Path
from datetime import datetime
import sqlite3
from flask import Flask, request, jsonify, send_from_directory, abort

APP_DIR = Path(__file__).parent.resolve()
DB_PATH = APP_DIR / "scores.db"
STATIC_DIR = APP_DIR  # static files (snake_game.html, snake_game.css, snake_game.js) live in repo root

app = Flask(__name__)


def get_db_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                score INTEGER NOT NULL,
                ts TEXT NOT NULL
            );
            """
        )
        conn.commit()
    finally:
        conn.close()


def row_to_dict(row: sqlite3.Row):
    return {
        "id": row["id"],
        "name": row["name"],
        "score": row["score"],
        "ts": row["ts"],
    }


# Initialize DB on import/startup
init_db()


# ----- Static file routes -----
@app.route("/")
def index():
    return send_from_directory(str(STATIC_DIR), "snake_game.html")


@app.route("/<path:filename>")
def static_files(filename):
    # Prevent serving the database file via this route
    if filename == DB_PATH.name:
        abort(404)
    return send_from_directory(str(STATIC_DIR), filename)


# ----- API -----
@app.route("/api/scores", methods=["GET"])
def get_scores():
    try:
        limit = int(request.args.get("limit", 10))
    except ValueError:
        return jsonify({"error": "invalid limit"}), 400

    if limit <= 0:
        return jsonify({"error": "limit must be positive"}), 400

    conn = get_db_connection()
    try:
        cur = conn.execute(
            "SELECT id, name, score, ts FROM scores ORDER BY score DESC, ts ASC LIMIT ?",
            (limit,),
        )
        rows = cur.fetchall()
        scores = [row_to_dict(r) for r in rows]
        return jsonify(scores)
    finally:
        conn.close()


@app.route("/api/scores", methods=["POST"])
def post_score():
    if not request.is_json:
        return jsonify({"error": "expected application/json"}), 400

    data = request.get_json()
    if data is None:
        return jsonify({"error": "invalid json body"}), 400

    # Validate score
    if "score" not in data:
        return jsonify({"error": "missing 'score' field"}), 400

    try:
        score = int(data["score"])
    except (TypeError, ValueError):
        return jsonify({"error": "'score' must be an integer"}), 400

    name = data.get("name")
    if name is not None:
        name = str(name).strip()
        if name == "":
            name = None

    ts = datetime.utcnow().isoformat() + "Z"

    conn = get_db_connection()
    try:
        cur = conn.execute(
            "INSERT INTO scores (name, score, ts) VALUES (?, ?, ?)",
            (name, score, ts),
        )
        conn.commit()
        new_id = cur.lastrowid
        cur = conn.execute(
            "SELECT id, name, score, ts FROM scores WHERE id = ?", (new_id,)
        )
        row = cur.fetchone()
        return jsonify(row_to_dict(row)), 201
    finally:
        conn.close()


if __name__ == "__main__":
    # Run the dev server for local testing
    app.run(host="127.0.0.1", port=5000, debug=True)
