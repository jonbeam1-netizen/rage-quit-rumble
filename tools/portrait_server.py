"""Tiny local helper: receives PNG portraits POSTed by tools/portraits.html and writes
them to assets/portraits/. Run from the repo root:  python tools/portrait_server.py
Then open http://localhost:8080/tools/portraits.html (with the normal dev server running).
"""
import os, re, sys
from http.server import BaseHTTPRequestHandler, HTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "portraits")
os.makedirs(OUT, exist_ok=True)

class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")

    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()

    def do_POST(self):
        m = re.match(r"^/save/([A-Za-z0-9_\-]+)$", self.path)
        if not m:
            self.send_response(404); self._cors(); self.end_headers(); return
        n = int(self.headers.get("Content-Length", "0"))
        data = self.rfile.read(n)
        path = os.path.join(OUT, m.group(1) + ".png")
        with open(path, "wb") as f:
            f.write(data)
        print(f"saved {path} ({len(data)} bytes)")
        self.send_response(200); self._cors(); self.end_headers()
        self.wfile.write(b"ok")

    def log_message(self, *a):
        pass

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8090
    print(f"portrait server on http://localhost:{port}, writing to {OUT}")
    HTTPServer(("127.0.0.1", port), H).serve_forever()
