"""Bump the cache-busting version on every ?v= module URL in the HTML pages.
Run before each deploy:  python tools/bump.py
Browsers (and GitHub Pages' 10-minute cache) then fetch fresh JS instead of stale copies.
"""
import os, re, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = time.strftime("%Y%m%d%H%M")
pages = [f for f in os.listdir(ROOT) if f.endswith(".html")]
for page in pages:
    path = os.path.join(ROOT, page)
    s = open(path, encoding="utf-8").read()
    new = re.sub(r"\?v=\d+", "?v=" + VERSION, s)
    if new != s:
        open(path, "w", encoding="utf-8", newline="\n").write(new)
        print(f"{page}: v={VERSION}")
