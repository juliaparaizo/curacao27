"""Open a built site in a headless browser, report errors and save screenshots.

python tools/check_site.py dist --shots docs/screenshots/rio --hashes "" dia-1 dia-2
"""
from __future__ import annotations

import argparse
import functools
import json
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import Error as PlaywrightError, sync_playwright

VIEWPORTS = {"desktop": {"width": 1440, "height": 900}, "mobile": {"width": 390, "height": 844}}
LOAD_TIMEOUT_MS = 180_000
SETTLE_MS = 3500
# a real GPU when Chrome is installed; software rendering is too slow for this scene
GPU_ARGS = ["--use-angle=metal", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"]
SOFTWARE_ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
IGNORED = ("open-meteo.com", "favicon")


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args: object) -> None:
        pass


def serve(folder: Path) -> ThreadingHTTPServer:
    handler = functools.partial(QuietHandler, directory=str(folder))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


def stats(page) -> dict:
    return page.evaluate("""() => {
      const card = document.querySelector('#card');
      const box = card.hidden ? null : card.getBoundingClientRect();
      const pins = [...document.querySelectorAll('.pin')].filter(p => p.style.display !== 'none').length;
      return {hash: location.hash, card: box && [box.left, box.top, box.width, box.height].map(Math.round), pins};
    }""")


def check(folder: Path, shots: Path, hashes: list[str]) -> list[str]:
    problems: list[str] = []
    server = serve(folder)
    url = f"http://127.0.0.1:{server.server_port}/index.html"
    shots.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        try:
            browser = playwright.chromium.launch(channel="chrome", args=GPU_ARGS)
        except PlaywrightError:
            browser = playwright.chromium.launch(args=SOFTWARE_ARGS)
        for name, viewport in VIEWPORTS.items():
            context = browser.new_context(viewport=viewport, is_mobile=name == "mobile", has_touch=name == "mobile", service_workers="block")
            page = context.new_page()
            page.on("console", lambda m: problems.append(f"{name} console: {m.text}") if m.type == "error" and not any(i in m.text for i in IGNORED) else None)
            page.on("pageerror", lambda e: problems.append(f"{name} exception: {e}"))
            page.on("response", lambda r: problems.append(f"{name} HTTP {r.status}: {r.url}") if r.status >= 400 and not any(i in r.url for i in IGNORED) else None)
            page.goto(url, wait_until="commit")  # the module awaits the first map, which is slow without a GPU
            try:
                page.wait_for_function("window.__ready === true", timeout=LOAD_TIMEOUT_MS)
            except Exception as exc:
                problems.append(f"{name}: site never finished loading ({str(exc)[:80]})")
            for index, target in enumerate(hashes):
                page.evaluate("h => { location.hash = h }", target)
                page.wait_for_timeout(SETTLE_MS)
                page.screenshot(path=str(shots / f"{name}-{index:02d}-{target or 'home'}.png"))
                print(name, json.dumps(stats(page)))
            page.close()
            context.close()
        browser.close()
    server.shutdown()
    return problems


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("folder", type=Path)
    parser.add_argument("--shots", type=Path, default=Path("docs/screenshots/_tmp"))
    parser.add_argument("--hashes", nargs="*", default=[""])
    args = parser.parse_args()
    problems = check(args.folder, args.shots, args.hashes)
    print("\n".join(problems) if problems else "no errors")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
