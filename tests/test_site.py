from PIL import Image

from pipeline.routes import insert_via, route_days
import pytest

from pipeline.site import SITE_DIR, credits, fill_template, mean_longitude, site_data, trim_white

MODULES = {"weather": True, "surf": False, "tides": False}


def test_via_point_goes_where_the_detour_is_shortest():
    assert insert_via([(0, 0), (0, 10), (0, 20)], [(1, 15)]) == [(0, 0), (0, 10), (1, 15), (0, 20)]


def test_route_is_requested_once_and_failures_fall_back_to_straight_lines():
    places = {"a": {"lat": 0, "lon": 0, "map": "m"}, "b": {"lat": 1, "lon": 1, "map": "m"}}
    day = {"n": 1, "route": "road", "route_via": [], "crosses_maps": False, "legs": [{"map": "m", "stops": ["a", "b"]}]}
    calls, lock = [], {"routes": {}}
    for _ in range(2):
        days, notes = route_days([day], places, lock, lambda p: calls.append(p) or [[0, 0], [0.5, 0.5], [1, 1]])
    assert len(calls) == 1 and len(days[0]["legs"][0]["line"]) == 3 and notes == []
    days, notes = route_days([day], places, {"routes": {}}, lambda p: None)
    assert days[0]["legs"][0]["line"] == [[0, 0], [1, 1]] and len(notes) == 1


def test_day_starts_and_ends_at_home_on_the_same_map():
    places = {"home": {"lat": 0, "lon": 0, "map": "m"}, "b": {"lat": 1, "lon": 1, "map": "m"}}
    day = {"n": 1, "route": "line", "route_via": [], "crosses_maps": False, "legs": [{"map": "m", "stops": ["b"]}]}
    assert route_days([day], places, {"routes": {}}, lambda p: None)[0][0]["legs"][0]["line"] == [[0, 0], [1, 1], [0, 0]]


def test_credits_follow_the_modules_in_use():
    assert not any("NOAA" in c["text"] for c in credits(MODULES, ["Inter"]))
    assert any("NOAA" in c["text"] for c in credits({**MODULES, "tides": True}, ["Inter"]))
    assert any("Open Database License" in c["text"] for c in credits(MODULES, []))


def test_white_borders_are_cropped():
    image = Image.new("RGB", (100, 100), "white")
    image.paste((10, 20, 30), (20, 30, 60, 80))
    assert trim_white(image).size == (40, 50)


def test_title_is_escaped_in_pages():
    trip = {"title": 'A <b> "trip"', "language": "en", "subtitle": ""}
    out = fill_template("<title>{{TITLE}}</title>", trip, {"colors": {"ink": "#000"}})
    assert out == "<title>A &lt;b&gt; &quot;trip&quot;</title>"


def test_site_data_knows_when_a_trip_has_many_maps():
    place = {"id": "a", "name": "A", "lat": 0, "lon": 0, "type": "sight", "query": "A"}
    item = {"id": "map-1", "title": "T", "timezone": "UTC", "places": ["a"], "bbox": {"lat0": 0, "lat1": 1, "lon0": 0, "lon1": 1}}
    trip = {"title": "T", "subtitle": "", "start": "2026-01-01", "end": "2026-01-01", "language": "en", "units": {},
            "modules": MODULES, "maps": [item], "places": [place], "stories": [], "downloads": [], "services": {},
            "landmarks": None, "days": [{"n": 1, "date": "2026-01-01", "title": "", "area": "", "map": "map-1", "crosses_maps": False,
                                         "items": [{"time": "", "type": None, "text": "x", "place": "a"}],
                                         "legs": [{"map": "map-1", "stops": ["a"], "line": [[0, 0]]}]}]}
    data = site_data(trip, {"colors": {"bg": "#fff", "card": "#fff"}}, [])
    assert data["overview"] is False
    assert data["places"][0]["items"][0]["day"] == 1
    assert data["days"][0]["items"][0]["type"] == "sight" and data["days"][0]["tz"] == "UTC"


def test_service_worker_template_keeps_its_placeholders():
    template = (SITE_DIR / "sw.js").read_text(encoding="utf-8")
    assert "'__CORE__'" in template and "__VERSION__" in template and "key.startsWith('__NAME__-')" in template


def test_mean_longitude_works_across_the_antimeridian():
    assert abs(mean_longitude([179.9, -179.9])) == pytest.approx(180)
    assert mean_longitude([10, 20]) == pytest.approx(15)


def test_hops_skip_home_on_arrival_and_departure():
    places = {"home": {"lat": 0, "lon": 0, "map": "m"}, "air": {"lat": 1, "lon": 0, "map": "m", "type": "travel"},
              "b": {"lat": 0, "lon": 1, "map": "m", "type": "beach"}}
    day = {"n": 1, "route": "road", "route_via": [], "crosses_maps": False, "legs": [{"map": "m", "stops": ["b", "air"]}]}
    hops = route_days([day], places, {"routes": {}}, lambda p: None)[0][0]["legs"][0]["hops"]
    assert [(h["from"], h["to"]) for h in hops] == [("home", "b"), ("b", "air")]
    assert hops[0]["km"] > 100
