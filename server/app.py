from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import time
import os
import re

import db

app = Flask(__name__)
CORS(app)

# Initialize SQLite DB
db.init_db()

# Simple in-memory rate limiter per IP (sliding window)
_RATE_WINDOW = 60  # seconds
_MAX_PER_WINDOW = 20
_rate_store = {}  # ip -> list[timestamp]

# Basic input constraints
_MAX_NAME_LEN = 32
_ISO_RE = re.compile(r'^\d{4}-\d{2}-\d{2}T')

def _get_client_ip():
    # Prefer X-Forwarded-For if present (useful behind proxies); otherwise remote_addr
    xff = request.headers.get('X-Forwarded-For', '')
    if xff:
        return xff.split(',')[0].strip()
    return request.remote_addr or 'unknown'

def _rate_check(ip):
    now = time.time()
    arr = _rate_store.get(ip) or []
    # keep only recent timestamps
    arr = [t for t in arr if now - t < _RATE_WINDOW]
    if len(arr) >= _MAX_PER_WINDOW:
        _rate_store[ip] = arr
        return False
    arr.append(now)
    _rate_store[ip] = arr
    return True

def _validate_name(name):
    if name is None:
        return None
    s = str(name).strip()
    if not s:
        return None
    if len(s) > _MAX_NAME_LEN:
        s = s[:_MAX_NAME_LEN]
    return s

def _validate_score(score):
    try:
        s = int(score)
        if s < 0:
            s = 0
        return s
    except Exception:
        return 0

def _validate_ts(ts):
    if ts and isinstance(ts, str) and _ISO_RE.match(ts):
        return ts
    return datetime.datetime.utcnow().isoformat() + 'Z'

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

@app.route('/api/scores', methods=['GET'])
def get_scores():
    """
    Returns the global scores as JSON array, sorted by score desc then timestamp asc.
    Optional query param: ?limit=50
    """
    limit = 50
    try:
        limit = int(request.args.get('limit', limit))
    except Exception:
        limit = 50

    scores = db.get_scores(limit=limit)
    # db.get_scores already returns ordered results
    return jsonify(scores), 200

@app.route('/api/scores', methods=['POST'])
def post_score():
    """
    Accepts JSON { name: string|null, score: number, ts?: string }.
    Stores it and returns the stored object with timestamp.
    Implements simple rate-limiting and server-side validation.
    """
    ip = _get_client_ip()
    if not _rate_check(ip):
        return jsonify({'error': 'rate limit exceeded'}), 429

    try:
        payload = request.get_json(force=True) or {}
    except Exception:
        return jsonify({'error': 'invalid json'}), 400

    name = _validate_name(payload.get('name'))
    score = _validate_score(payload.get('score', 0))
    ts = _validate_ts(payload.get('ts'))

    entry = db.add_score(name, score, ts)
    return jsonify(entry), 201

if __name__ == '__main__':
    # Development server
    app.run(host='0.0.0.0', port=5000, debug=True)
