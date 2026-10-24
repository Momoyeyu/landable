#!/usr/bin/env python3
"""Publish the actual daily GitHub Trending order as same-origin website data.

Browsers cannot read github.com/trending cross-origin. Pages runs this stdlib
script daily and on deploy; no proxy service or browser credential is needed.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import importlib.util
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("trending", ROOT / "landable/scripts/trending.py")
trending = importlib.util.module_from_spec(spec)
spec.loader.exec_module(trending)


def trending_snapshot(page: str) -> dict:
    repos = []
    seen = set()
    for repo in trending.parse_trending(page):
        name = repo["name"]
        if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", name) or name.lower() in seen:
            continue
        seen.add(name.lower())
        repos.append(repo)
        if len(repos) == 20:
            break
    if not repos:
        raise ValueError("No repositories found on GitHub Trending; keeping the previous snapshot")
    return {
        "source": "https://github.com/trending?since=daily",
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "repositories": repos,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--html", type=Path, help="Saved Trending HTML, for local verification")
    args = parser.parse_args()
    page = args.html.read_text() if args.html else trending.fetch()
    result = trending_snapshot(page)
    target = ROOT / "web/data/trending.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_suffix(".tmp")
    temporary.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    temporary.replace(target)
    print(f"Published {len(result['repositories'])} daily Trending repositories")


if __name__ == "__main__":
    main()
