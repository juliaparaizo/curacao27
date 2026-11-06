import numpy as np
import pytest

from pipeline.scene import conifer_share
from pipeline.texture import ramp, rgb, to_pixels
from pipeline.theme import deep_merge, load_theme
from pipeline.vectors import bbox_tuples, is_tunnel, pick_towns, road_classes


def test_user_theme_overrides_only_what_it_sets():
    merged = deep_merge({"map": {"sand": "a", "road": "b"}}, {"map": {"sand": "c"}})
    assert merged == {"map": {"sand": "c", "road": "b"}}


def test_default_theme_has_every_map_color():
    colors = load_theme(None)["map"]
    assert {"land_low", "land_mid", "land_high", "dry", "rock", "snow", "sea_deep", "river"} <= set(colors)


def test_ramp_interpolates_between_stops():
    out = ramp(np.array([0.5]), [(0, rgb("#000000")), (1, rgb("#FFFFFF"))])
    assert np.allclose(out[0], 0.5)


def test_corner_coordinates_land_on_image_corners():
    box = {"lon0": 10, "lon1": 20, "lat0": 40, "lat1": 50}
    assert to_pixels([[10, 50], [20, 40]], box, 100, 200) == [(0, 0), (100, 200)]


def test_bigger_maps_keep_fewer_road_classes():
    assert "residential" in road_classes(30)
    assert "residential" not in road_classes(100) and "tertiary" in road_classes(100)
    assert "tertiary" not in road_classes(300)


def test_tunnels_are_detected_in_road_flags():
    assert is_tunnel([{"values": ["is_bridge"]}, {"values": ["is_tunnel"]}])
    assert not is_tunnel(None)


def test_towns_keep_the_biggest_and_skip_close_neighbors():
    towns = [{"name": "Small", "class": "village", "population": 10, "lat": 0.0, "lon": 0.0},
             {"name": "Big", "class": "city", "population": 900, "lat": 0.001, "lon": 0.0},
             {"name": "Far", "class": "town", "population": None, "lat": 1.0, "lon": 1.0}]
    assert [t["name"] for t in pick_towns(towns, 100)] == ["Big", "Far"]


def test_tropical_lowlands_have_no_conifers():
    assert conifer_share(21, np.array([0.0]))[0] == 0
    assert conifer_share(60, np.array([0.0]))[0] > 0.5


def test_vector_query_splits_at_the_antimeridian():
    box = {"lat0": -17, "lat1": -16, "lon0": -181.0, "lon1": -179.0}
    assert bbox_tuples(box) == [(179.0, -17, 180.0, -16), (-180.0, -17, -179.0, -16)]


def test_longitudes_join_a_box_that_passes_180():
    box = {"lat0": 0, "lat1": 1, "lon0": 179.0, "lon1": 181.0}
    assert to_pixels([[-179.5, 1.0]], box, 200, 100)[0][0] == pytest.approx(150)
