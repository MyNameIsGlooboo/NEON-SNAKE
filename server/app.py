from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import datetime

app = Flask(__name__)
CORS(app)

DATA_FILE = os.path.join(os.path.dirname(__file__), 'scores.json')
MAX_STORE = 2000

def _ensure_datafile():
    if not os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'w', encoding='utf-8') as fh:
                json.dump([], fh)
        except Exception:
            pass

def load_scores():
    _ensure_datafile()
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as fh:
            return json.load(fh)
    except Exception:
        return []

def save_scores(scores):
    # keep file bounded
    scores = scores[-MAX_STORE:]
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as fh:
            json.dump(scores, fh, ensure_ascii=False, indent=2)
    except Exception:
        pass

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

    scores = load_scores()
    try:
        scores_sorted = sorted(
            scores,
            key=lambda s: (-(int(s.get('score', 0)) if s.get('score') is not None else 0),
                           s.get('ts', ''))
        )
    except Exception:
        scores_sorted = scores
    return jsonify(scores_sorted[:limit]), 200

@app.route('/api/scores', methods=['POST'])
def post_score():
    """
    Accepts JSON { name: string|null, score: number, ts?: string }.
    Stores it and returns the stored object with timestamp.
    """
    payload = {}
    try:
        payload = request.get_json(force=True) or {}
    except Exception:
        return jsonify({'error': 'invalid json'}), 400

    name = payload.get('name') if payload.get('name') not in (None, '') else None
    try:
        score = int(payload.get('score', 0))
    except Exception:
        score = 0

    ts = payload.get('ts') or datetime.datetime.utcnow().isoformat() + 'Z'

    entry = {'name': name, 'score': score, 'ts': ts}

    scores = load_scores()
    scores.append(entry)
    save_scores(scores)

    return jsonify(entry), 201

if __name__ == '__main__':
    # Run simple dev server. For production, use a proper WSGI server.
    app.run(host='0.0.0.0', port=5000, debug=True)
