import pytest
import yaml

from pipeline.geocode import choose, resolve_places
from pipeline.regions import assign_days, bounding_box, build_maps, cluster
from pipeline.schema import TripError, normalize

UTAH = [(37.27, -112.95), (37.59, -112.19), (38.29, -111.26), (38.68, -109.57), (38.33, -109.85)]
EUROPE = [(38.70, -9.20), (38.72, -9.14), (41.90, 12.48), (41.89, 12.49), (46.59, 7.91), (46.54, 7.96)]


def base(**extra):
    return {"title": "T", "dates": {"start": "2026-01-01"}, "days": [{"items": [{"text": "x"}]}], **extra}


def with_place(**extra):
    return base(places=[{"name": "P", "lat": 1, "lon": 2}], **extra)


def test_unquoted_yaml_time_comes_back_as_clock_time():
    raw = yaml.safe_load("title: T\ndates: {start: 2026-01-01}\ndays:\n- items:\n  - {time: 12:00, text: lunch, place: Bar}\n")
    assert normalize(raw)["days"][0]["items"][0]["time"] == "12:00"


def test_brazilian_time_format_is_normalized():
    raw = base(days=[{"items": [{"time": "16h30", "text": "a", "place": "X"}, {"time": "21h", "text": "b"}]}])
    assert [i["time"] for i in normalize(raw)["days"][0]["items"]] == ["16:30", "21:00"]


def test_all_errors_are_reported_together_in_both_languages():
    with pytest.raises(TripError) as caught:
        normalize({"days": []})
    assert len(caught.value.errors) == 3
    assert "falta o title" in caught.value.errors[0]


def test_place_named_only_in_a_day_is_created_once():
    raw = base(days=[{"items": [{"text": "a", "place": "Ray's, Haleiwa"}, {"text": "b", "place": "Ray's, Haleiwa"}]}])
    trip = normalize(raw)
    assert [(p["id"], p["name"], p["query"]) for p in trip["places"]] == [("ray-s", "Ray's", "Ray's, Haleiwa")]


def test_photo_outside_the_project_is_refused():
    with pytest.raises(TripError):
        normalize(base(places=[{"name": "A", "lat": 1, "lon": 2, "photo": "../../secret.jpg"}]))


def test_road_trip_stays_on_one_map():
    assert len(cluster(UTAH, 400)) == 1


def test_far_apart_regions_split():
    assert cluster(EUROPE, 400) == [[0, 1], [2, 3], [4, 5]]


def test_a_mostly_empty_map_splits_even_under_the_limit():
    city = [(21.3, -157.8), (21.4, -157.9), (21.5, -158.0)]
    assert len(cluster(city + [(19.7, -155.1)], 400)) == 2


def test_same_spot_twice_does_not_break_clustering():
    assert cluster([(1.0, 1.0), (1.0, 1.0)], 400) == [[0, 1]]


def test_box_respects_ratio_and_minimum():
    wide = bounding_box(UTAH)
    assert wide["km_x"] / wide["km_y"] == pytest.approx(1.6)
    assert bounding_box([(0.0, 0.0)])["km_x"] == 12


def test_box_across_the_antimeridian_is_narrow():
    box = bounding_box([(-17.0, 179.9), (-17.1, -179.9)])
    assert box["km_x"] < 40


def test_day_crossing_maps_becomes_legs_in_visiting_order():
    places = [{"id": str(i), "lat": la, "lon": lo} for i, (la, lo) in enumerate(EUROPE)]
    maps = build_maps(places, 400)
    day = {"n": 1, "items": [{"place": "0"}, {"place": "2"}, {"place": "3"}]}
    result = assign_days([day], maps)[0]
    assert result["crosses_maps"]
    assert [leg["map"] for leg in result["legs"]] == ["map-1", "map-2"]
    assert result["map"] == "map-2"


def test_day_without_places_stays_on_the_previous_map():
    places = [{"id": str(i), "lat": la, "lon": lo} for i, (la, lo) in enumerate(EUROPE)]
    maps = build_maps(places, 400)
    days = assign_days([{"n": 1, "items": [{"place": "2"}]}, {"n": 2, "items": [{"place": None}]}], maps)
    assert days[1]["map"] == "map-2"


def test_context_beats_a_wrong_top_result():
    wrong, right = {"lat": 40.0, "lon": -100.0}, {"lat": 41.9, "lon": 12.48}
    picks = choose({"trevi": [wrong, right]}, [(41.89, 12.49)])
    assert picks == {"trevi": 1}


def test_lookups_use_the_lock_and_never_repeat():
    trip = normalize(base(days=[{"items": [{"text": "a", "place": "Somewhere"}]}]))
    hit = {"lat": 1.0, "lon": 2.0, "label": "Somewhere, X", "osm": "restaurant"}
    calls = []
    lock = {"geocode": {}}
    for _ in range(2):
        places, _report = resolve_places(trip, lock, lambda q: calls.append(q) or [hit])
    assert calls == ["Somewhere"]
    assert places[0]["type"] == "food"


def test_place_not_found_stops_with_a_clear_message():
    trip = normalize(base(days=[{"items": [{"text": "a", "place": "Nowhere"}]}]))
    with pytest.raises(LookupError, match="Nowhere"):
        resolve_places(trip, {"geocode": {}}, lambda q: [])


def test_trip_with_no_places_gets_a_clear_message():
    with pytest.raises(TripError, match="at least one place"):
        normalize(base())


def test_story_needs_its_fields_and_accepts_one_paragraph():
    raw = base(days=[{"items": [{"text": "a", "place": "X"}]}], stories=[{"title": "T", "lat": 1, "lon": 2, "story": "One line"}])
    assert normalize(raw)["stories"][0]["story"] == ["One line"]
    raw["stories"] = [{"title": "T"}]
    with pytest.raises(TripError):
        normalize(raw)
