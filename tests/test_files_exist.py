import pathlib

BASE = pathlib.Path(__file__).parent.parent

def test_files_exist_and_are_linked():
    html = BASE / "snake_game.html"
    css = BASE / "snake_game.css"
    js = BASE / "snake_game.js"

    assert html.exists(), "snake_game.html is missing"
    assert css.exists(), "snake_game.css is missing"
    assert js.exists(), "snake_game.js is missing"

    html_text = html.read_text(encoding="utf-8")
    assert '<link rel="stylesheet" href="snake_game.css">' in html_text, "HTML does not link snake_game.css"
    assert '<script src="snake_game.js"></script>' in html_text, "HTML does not include snake_game.js"

def test_js_and_css_basic_content():
    css = BASE / "snake_game.css"
    js = BASE / "snake_game.js"

    css_text = css.read_text(encoding="utf-8")
    js_text = js.read_text(encoding="utf-8")

    assert ".game-container" in css_text, "snake_game.css looks incomplete (no .game-container)"
    assert "function initGame" in js_text or "initGame = " in js_text, "snake_game.js looks incomplete (no initGame)"
