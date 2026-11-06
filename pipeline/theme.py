"""Merge a preset with the user's theme.yaml."""
from __future__ import annotations

import re
from pathlib import Path

import yaml

from .schema import TripError, both

PRESETS = Path(__file__).resolve().parent.parent / "presets"
DEFAULT_PRESET = "oahu"
FONT_NAME = re.compile(r"[A-Za-z0-9 ]+")
HEX_COLOR = re.compile(r"#[0-9A-Fa-f]{6}")


def deep_merge(base: dict, override: dict) -> dict:
    merged = dict(base)
    for key, value in override.items():
        merged[key] = deep_merge(base[key], value) if isinstance(value, dict) and isinstance(base.get(key), dict) else value
    return merged


def check_theme(theme: dict) -> None:
    """Theme values go straight into CSS and file names."""
    errors = [both(f"font name not allowed: {name}", f"nome de fonte inválido: {name}")
              for name in (theme["fonts"][k] for k in ("display", "body", "mono")) if not FONT_NAME.fullmatch(str(name))]
    colors = {**theme["colors"], **{k: v for k, v in theme["map"].items() if k != "exaggeration"}}
    errors += [both(f"{key} must be a color like #1C221E", f"{key} precisa ser uma cor como #1C221E")
               for key, value in colors.items() if not HEX_COLOR.fullmatch(str(value))]
    day_colors = theme.get("ui", {}).get("day_colors")
    if isinstance(day_colors, list):
        errors += [both(f"day_colors: {c} is not a color", f"day_colors: {c} não é uma cor") for c in day_colors if not HEX_COLOR.fullmatch(str(c))]
    errors += [both(f"pins: {name} needs a color like #1C221E", f"pins: {name} precisa de uma cor como #1C221E")
               for name, pin in theme.get("pins", {}).get("types", {}).items() if pin.get("color") and not HEX_COLOR.fullmatch(str(pin["color"]))]
    if errors:
        raise TripError(errors)


def load_theme(path: Path | None) -> dict:
    user = yaml.safe_load(path.read_text(encoding="utf-8")) or {} if path and path.exists() else {}
    preset = PRESETS / f'{user.get("preset", DEFAULT_PRESET)}.yaml'
    if not preset.exists():
        names = ", ".join(sorted(p.stem for p in PRESETS.glob("*.yaml")))
        raise TripError([both(f'unknown preset "{preset.stem}". Available: {names}',
                              f'preset desconhecido "{preset.stem}". Disponíveis: {names}')])
    theme = deep_merge(yaml.safe_load(preset.read_text(encoding="utf-8")), user)
    check_theme(theme)
    return theme
