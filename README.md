# testingmeow

Interactive riddle demo

Files added under `riddle/`:

- `index.html` — the interactive riddle page (HTML)
- `styles.css` — styles for the page (CSS)
- `script.js` — logic for guesses, hints, and revealing the answer (JS)
- `assets/answer.svg` — picture used as the revealed answer (SVG)

To open the riddle locally, open `riddle/index.html` in a browser. For example:

```bash
# from the repo root
xdg-open riddle/index.html
```

Or serve with a tiny static server (Python 3):

```bash
python3 -m http.server --directory riddle 8000
# then open http://localhost:8000
```
