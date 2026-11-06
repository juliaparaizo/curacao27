"""Run the release checklist on a built site, in a real browser, and print one line per check.

python tools/check_trip.py dist --name rio --shots docs/screenshots/rio
"""
from __future__ import annotations

import argparse
import io
import json
import sys
from pathlib import Path

import numpy as np
from check_site import GPU_ARGS, VIEWPORTS, serve
from PIL import Image
from playwright.sync_api import sync_playwright

LOAD_MS = 90_000
FLY_MS = 1900
FPS_SECONDS = 3
EMPTY_SHARE_LIMIT = 0.02
COLOR_TOLERANCE = 4
SCREEN_MARGIN = 2


def trip_of(page) -> dict:
    return page.evaluate("""() => ({days: TRIP.days.length, overview: TRIP.overview, weather: TRIP.modules.weather,
      bg: TRIP.palette.bg, first: TRIP.days[0].date, center: TRIP.days.find(d => d.center).center})""")


def empty_share(page, bg: str) -> float:
    """Share of the screen showing the bare page background instead of the map."""
    pixels = np.asarray(Image.open(io.BytesIO(page.screenshot())).convert("RGB")).astype(int)
    color = np.array([int(bg[i:i + 2], 16) for i in (1, 3, 5)])
    return float((np.abs(pixels - color).max(axis=2) <= COLOR_TOLERANCE).mean())


def open_hash(page, target: str) -> None:
    page.evaluate("h => { location.hash = h }", target)
    page.wait_for_timeout(FLY_MS)


def check_days(page, viewport: dict, count: int, bg: str) -> dict:
    """Every day: the route inside the screen, clear of the card, no empty background."""
    covered, off_screen, empty = [], [], []
    for n in range(1, count + 1):
        open_hash(page, f"dia-{n}")
        result = page.evaluate("""() => {
          const box = document.querySelector('#card').getBoundingClientRect(), points = window.__debug.route();
          return {covered: points.filter(p => p.x > box.left && p.x < box.right && p.y > box.top && p.y < box.bottom).length,
                  outside: points.filter(p => p.x < 0 || p.y < 0 || p.x > innerWidth || p.y > innerHeight).length, total: points.length}; }""")
        if result["covered"]:
            covered.append(f'{n}:{result["covered"]}/{result["total"]}')
        if result["outside"]:
            off_screen.append(f'{n}:{result["outside"]}/{result["total"]}')
        share = empty_share(page, bg)
        if share > EMPTY_SHARE_LIMIT:
            empty.append(f"{n}:{share:.0%}")
    return {"route under card": covered, "route off screen": off_screen, "empty background": empty}


def check_home(page, overview: bool) -> list[str]:
    open_hash(page, "")
    return page.evaluate("""m => window.__debug.places().filter(p => !p.ok || p.x < 2 || p.y < 2 || p.x > innerWidth - 2 || p.y > innerHeight - 2).map(p => p.name)""", overview)


def fps(page) -> float:
    return page.evaluate("""seconds => new Promise(done => { let frames = 0; const start = performance.now();
      const count = now => { frames++; now - start < seconds * 1000 ? requestAnimationFrame(count) : done(frames / seconds); };
      requestAnimationFrame(count); })""", FPS_SECONDS)


def check_interactions(page, trip: dict) -> dict:
    found = {}
    page.fill("#q", "a")
    page.wait_for_timeout(300)
    found["search"] = page.evaluate("document.querySelectorAll('#results li[data-i]').length") > 0
    page.fill("#q", "")
    open_hash(page, "dia-1")
    before = page.evaluate("[...document.querySelectorAll('.pin')].filter(p => p.style.display !== 'none').length")
    page.evaluate("document.querySelector('#legendBody button').click()")
    page.wait_for_timeout(500)
    after = page.evaluate("[...document.querySelectorAll('.pin')].filter(p => p.style.display !== 'none').length")
    page.evaluate("document.querySelector('#legendBody button').click()")
    found["filters"] = after <= before
    if trip["weather"]:
        page.evaluate("document.querySelector('#condBtn').click()")
        page.wait_for_timeout(600)
        found["weather panel"] = page.evaluate("document.querySelector('#condBody').innerText.length") > 20
        page.evaluate("document.querySelector('#condX').click()")
    return found


def check_today(browser, url: str, trip: dict) -> dict:
    context = browser.new_context(viewport=VIEWPORTS["desktop"], service_workers="block", permissions=["geolocation"],
                                  geolocation={"latitude": trip["center"][0], "longitude": trip["center"][1]})
    page = context.new_page()
    page.goto(f'{url}?debug&hoje={trip["first"]}T08:00', wait_until="commit")
    page.wait_for_function("window.__ready === true", timeout=LOAD_MS)
    page.wait_for_timeout(FLY_MS * 2)
    found = {"today mode": page.evaluate("location.hash") == "#dia-1"}
    page.evaluate("document.querySelector('#zme').click()")
    page.wait_for_timeout(2000)
    found["blue dot"] = page.evaluate("document.querySelector('#zme').getAttribute('aria-pressed')") == "true"
    context.close()
    return found


def check_offline(browser, url: str) -> bool:
    context = browser.new_context(viewport=VIEWPORTS["desktop"])
    page = context.new_page()
    page.goto(url, wait_until="commit")
    page.wait_for_function("window.__ready === true", timeout=LOAD_MS)
    page.evaluate("navigator.serviceWorker.ready.then(() => new Promise(r => setTimeout(r, 2500)))")
    page.reload(wait_until="commit")
    page.wait_for_function("window.__ready === true", timeout=LOAD_MS)
    context.set_offline(True)
    page.reload(wait_until="commit")
    try:
        page.wait_for_function("window.__ready === true", timeout=LOAD_MS)
        working = page.evaluate("document.querySelector('#offline').hidden === false")
    except Exception:
        working = False
    context.close()
    return working


def check_viewport(browser, url: str, name: str, shots: Path, errors: list[str]) -> dict:
    mobile = name == "mobile"
    context = browser.new_context(viewport=VIEWPORTS[name], is_mobile=mobile, has_touch=mobile, service_workers="block")
    page = context.new_page()
    page.on("pageerror", lambda e: errors.append(f"{name}: {e}"))
    page.on("console", lambda m: errors.append(f"{name}: {m.text}") if m.type == "error" and "open-meteo" not in m.text else None)
    page.goto(url + "?debug", wait_until="commit")
    page.wait_for_function("window.__ready === true", timeout=LOAD_MS)
    page.wait_for_timeout(FLY_MS)
    trip = trip_of(page)
    result = {"pins off screen at home": check_home(page, trip["overview"]), "fps": round(fps(page))}
    page.screenshot(path=str(shots / f"{name}-home.png"))
    result.update(check_days(page, VIEWPORTS[name], trip["days"], trip["bg"]))
    open_hash(page, "dia-1")
    page.screenshot(path=str(shots / f"{name}-day.png"))
    if not mobile:
        result.update(check_interactions(page, trip))
    context.close()
    return result


def size_without_photos(folder: Path) -> float:
    files = [p for p in folder.rglob("*") if p.is_file() and "img" not in p.relative_to(folder).parts]
    return sum(p.stat().st_size for p in files) / 1e6


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("folder", type=Path)
    parser.add_argument("--name", required=True)
    parser.add_argument("--shots", type=Path, required=True)
    args = parser.parse_args()
    args.shots.mkdir(parents=True, exist_ok=True)
    server = serve(args.folder)
    url = f"http://127.0.0.1:{server.server_port}/index.html"
    errors: list[str] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome", args=GPU_ARGS)
        report = {"trip": args.name, "dist_mb": round(size_without_photos(args.folder), 1)}
        report.update({name: check_viewport(browser, url, name, args.shots, errors) for name in VIEWPORTS})
        page = browser.new_page()
        page.goto(url, wait_until="commit")
        page.wait_for_function("window.__ready === true", timeout=LOAD_MS)
        trip = trip_of(page)
        page.close()
        report.update(check_today(browser, url, trip))
        report["offline"] = check_offline(browser, url)
        browser.close()
    server.shutdown()
    report["errors"] = sorted(set(errors))[:8]
    print(json.dumps(report, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
