import pytest

from pipeline.terrain import copernicus_tiles, exaggeration, grid_size, worldcover_tiles


def box(lat0, lat1, lon0, lon1):
    return {"lat0": lat0, "lat1": lat1, "lon0": lon0, "lon1": lon1}


def test_copernicus_tile_names_in_the_southern_and_western_hemispheres():
    urls = [url for url, _ in copernicus_tiles(box(-23.03, -22.87, -43.35, -43.10))]
    assert len(urls) == 2
    assert "S24_00_W044_00" in urls[0] and "S23_00_W044_00" in urls[1]


def test_box_on_a_degree_line_needs_both_tiles():
    assert len(copernicus_tiles(box(46.5, 46.6, 7.9, 8.1))) == 2


def test_worldcover_tiles_step_by_three_degrees():
    assert worldcover_tiles(box(21.2, 21.7, -158.3, -157.6))[0][0].endswith("N21W159_Map.tif")


def test_tiles_wrap_across_the_antimeridian():
    tiles = copernicus_tiles(box(-17.2, -17.0, 179.8, 180.2))
    assert [shift for _, shift in tiles] == [0.0, 360.0]
    assert "E179_00" in tiles[0][0] and "W180_00" in tiles[1][0]


def test_grid_keeps_proportion_and_does_not_oversample():
    assert grid_size(70, 56) == (860, 688)
    assert grid_size(10, 10) == (400, 400)


def test_exaggeration_matches_oahu_and_tames_tall_ranges():
    assert exaggeration(70, 1.2) == pytest.approx(4)
    assert exaggeration(100, 3.6) == pytest.approx(0.1 * 100 / 3.6)
    assert exaggeration(300, 0.05) > 4
