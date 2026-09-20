#!/usr/bin/env python3
"""Build data/emotional-intelligence.json from a compact schema.

Each concept is a tuple: (id, name, category, [(defn, scenario, opts, tip), ...]).
The correct answer is always options[0] here; the game shuffles at runtime.
Run:  python3 scripts/build_eq.py
"""
import json
from pathlib import Path

CONCEPTS = []  # extended in build_eq_data_*.py files (appended via edits below)

# We build the concept list piece-by-piece to keep tool payloads small.
# Import chunks live in build_eq_chunks.py — appended incrementally.
from build_eq_chunks import CONCEPTS as CHUNKS
CONCEPTS.extend(CHUNKS)

# Reuse the shared normalization logic so build output matches the fixups
# applied to hand-authored decks. Keeps stems out of scenarioDoneTo/YouDo
# and expands terse "Wise?" / "Move?" endings in the challenge scenario.
from normalize_kid_decks import clean_setup, expand_terse_stem


def build_card(cid, name, category, tiers):
    tier_map = {}
    for i, (defn, scen_q, opts, tip) in enumerate(tiers, start=1):
        scenario = expand_terse_stem(scen_q)
        setup = clean_setup(scenario)
        tier_map[str(i)] = {
            "definition": defn,
            "scenarioDoneTo": setup,
            "scenarioYouDo": setup,
            "challenge": {
                "scenario": scenario,
                "options": list(opts),
                "correct": 0,
            },
            "altChallenges": [],
            "tip": tip,
        }
    return {"id": cid, "name": name, "category": category, "tiers": tier_map}


def main():
    cards = [build_card(*c) for c in CONCEPTS]
    deck = {
        "deckName": "Feelings",
        "deckId": "emotional-intelligence",
        "description": "Notice feelings, name them, and choose the wise move.",
        "cards": cards,
    }
    out = Path(__file__).resolve().parent.parent / "data" / "emotional-intelligence.json"
    out.write_text(json.dumps(deck, indent=2, ensure_ascii=False))
    print(f"Wrote {out} with {len(cards)} concepts.")


if __name__ == "__main__":
    main()
