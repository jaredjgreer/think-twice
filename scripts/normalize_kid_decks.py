#!/usr/bin/env python3
"""Normalize terse question stems and cleanup scenarioDoneTo/YouDo in kid decks.

Rewrites in-place. Idempotent — safe to run multiple times.

Fixes two problems introduced by aggressive rewriting:
  1. challenge.scenario ends with a bare stem like "Bias?" / "Wise?" / "Move?"
     that lost meaning. We expand these to full questions.
  2. scenarioDoneTo / scenarioYouDo contain leftover question fragments
     ("You feel numb before a big event. Wise.") instead of clean declarative
     setups. We strip trailing question-ish sentences.

Run:  python3 scripts/normalize_kid_decks.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

KID_DECKS = [
    "emotional-intelligence.json",
    "cognitive-biases.json",
    "coping-toolkit.json",
    "cbt-distortions.json",
    "sunday.json",
    "gospel-questions.json",
]

# Terse stems (case-insensitive, optional trailing punctuation) → full question.
# Order matters: check longer phrases first.
STEM_EXPANSIONS = [
    (r"\bwise move\b\??$",       "What's the wise move?"),
    (r"\bbest move\b\??$",       "What's the best move?"),
    (r"\bnext move\b\??$",       "What's the next move?"),
    (r"\bwise\b\??$",            "What's the wise move?"),
    (r"\bbias\b\??$",            "Which bias is at play?"),
    (r"\bwhat bias\b\??$",       "Which bias is at play?"),
    (r"\bmove\b\??$",            "What's the move?"),
    (r"\bskill\b\??$",           "Which coping skill fits?"),
    (r"\btrap\b\??$",            "Which thinking trap is this?"),
    (r"\bdistortion\b\??$",      "Which distortion is this?"),
    (r"\bpick\b\??$",            "What should you pick?"),
    (r"\bbest\b\??$",            "What's the best move?"),
    (r"\bfirst\b\??$",           "What do you do first?"),
    (r"\bhealthy\b\??$",         "What's the healthy move?"),
    (r"\bhealthier\b\??$",       "What's the healthier thought?"),
    (r"\breframe\b\??$",         "What's the reframe?"),
    (r"\btool\b\??$",            "Which tool fits?"),
    (r"\btechnique\b\??$",       "Which technique fits?"),
    (r"\bpractice\b\??$",        "Which practice fits?"),
    (r"\bcheck\b\??$",           "What's the check?"),
    (r"\bintervention\b\??$",    "What's the intervention?"),
    (r"\bwhat helps\b\??$",      "What helps here?"),
    (r"\bbetter\b\??$",          "What's the better move?"),
    (r"\btruer\b\??$",           "What's the truer thought?"),
]

# Words that indicate a sentence is already a well-formed question and should
# not be rewritten by the generic "What's the ___?" rule.
_QUESTION_STARTERS = {
    "what", "what's", "whats", "which", "how", "why", "when", "where", "who",
    "whose", "is", "are", "was", "were", "am", "does", "do", "did", "should",
    "could", "would", "can", "will", "won't", "wouldn't", "shouldn't",
    "couldn't", "isn't", "aren't", "wasn't", "weren't", "has", "have", "had",
    "must", "may", "might", "shall",
}

SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")

# Sentence-boundary marker that also handles a closing quote after terminal
# punctuation (e.g. "…'burned out.' Wise?"). Variable-width lookbehind isn't
# supported in stdlib re, so we mark boundaries then split.
_SENT_BOUNDARY = re.compile(r"([.!?][\"'”’]?)\s+")

def _split_sentences(s: str) -> list[str]:
    marked = _SENT_BOUNDARY.sub(lambda m: m.group(1) + "\x00", s)
    return [p for p in marked.split("\x00") if p]

# Words that mark a sentence as a bare "what's the ___?" prompt fragment.
STEM_TRIGGER_WORDS = {
    "wise", "bias", "move", "skill", "trap", "distortion", "pick",
    "reframe", "tool", "technique", "practice", "check", "intervention",
    "healthy", "healthier", "best", "first",
}

# A trailing sentence is treated as a prompt fragment only if it *starts*
# with a question word or a bare trigger word — this avoids stripping real
# sentences that happen to contain e.g. "career move".
_STEM_FRAGMENT_START = re.compile(
    r"^(what|which|how|why|best|next|wise|bias|move|skill|trap|distortion|pick|"
    r"reframe|tool|technique|practice|check|intervention|healthy|healthier|"
    r"first)\b",
    re.IGNORECASE,
)

# Matches the output of the terse-stem expansion so those short prompt
# questions get stripped from scenarioDoneTo/YouDo too.
_EXPANDED_PROMPT = re.compile(
    r"^(what's|whats)\s+(the|a|an)\s+[a-z][a-z\- ']{1,40}\??$"
    r"|^which\s+[a-z][a-z\- ']{1,40}\??$"
    r"|^what\s+helps\b.*\??$",
    re.IGNORECASE,
)


def expand_terse_stem(scenario: str) -> str:
    """If the scenario ends with a bare shorthand question, expand it."""
    if not scenario:
        return scenario
    s = scenario.strip()
    parts = _split_sentences(s)
    if not parts:
        return s
    last = parts[-1].strip()
    for pattern, replacement in STEM_EXPANSIONS:
        if re.fullmatch(pattern, last, flags=re.IGNORECASE):
            parts[-1] = replacement
            return " ".join(parts)
    # Generic rule: a short (≤4 word) trailing noun-phrase question that
    # doesn't already start with a question word — turn "Discreet grounding?"
    # into "What's the discreet grounding move?"-style. Preserves single-word
    # legitimate questions ("Why?") by requiring ≥2 words.
    if last.endswith("?"):
        words = re.findall(r"[A-Za-z']+", last)
        if 2 <= len(words) <= 4 and words[0].lower() not in _QUESTION_STARTERS:
            phrase = last.rstrip("?").strip()
            parts[-1] = f"What's the {phrase.lower()}?"
            return " ".join(parts)
    return s


def clean_setup(text: str) -> str:
    """Return a clean declarative setup — drop trailing question fragments.

    "You feel numb before an event. Wise." → "You feel numb before an event."
    "You've been quiet all morning. What's wise?" → "You've been quiet all morning."
    """
    if not text:
        return text
    s = text.strip()
    parts = _split_sentences(s)
    # Drop a trailing sentence only if it is a bare shorthand stem fragment
    # (e.g. "Wise.", "Bias?", "What's wise.", "Move."). Real trailing questions
    # like "What should you remember?" are legitimate SPOT-mode context and
    # must be preserved.
    while parts:
        last = parts[-1].strip()
        if not last:
            parts.pop()
            continue
        words = re.findall(r"[A-Za-z']+", last.lower())
        starts_stem = bool(_STEM_FRAGMENT_START.match(last))
        has_trigger = any(w in STEM_TRIGGER_WORDS for w in words)
        is_expanded_prompt = bool(_EXPANDED_PROMPT.match(last))
        if len(words) <= 6 and ((has_trigger and starts_stem) or is_expanded_prompt):
            parts.pop()
            continue
        break
    if not parts:
        # Nothing left — fall back to original with '?' → '.'
        return s.replace("?", ".").strip()
    out = " ".join(parts).strip()
    if not re.search(r"[.!?][\"'”’)\]]?$", out):
        out += "."
    return out


def normalize_tier(tier: dict) -> tuple[dict, int]:
    """Return (updated_tier, num_changes)."""
    changes = 0
    ch = tier.get("challenge") or {}
    scen = ch.get("scenario", "")
    new_scen = expand_terse_stem(scen)
    if new_scen != scen:
        ch["scenario"] = new_scen
        tier["challenge"] = ch
        changes += 1

    for field in ("scenarioDoneTo", "scenarioYouDo"):
        if field in tier and tier[field]:
            cleaned = clean_setup(tier[field])
            if cleaned != tier[field]:
                tier[field] = cleaned
                changes += 1
    return tier, changes


def normalize_deck(path: Path) -> tuple[int, int]:
    data = json.loads(path.read_text())
    cards = data.get("cards", [])
    total_changes = 0
    touched_tiers = 0
    for card in cards:
        for tk, tier in card.get("tiers", {}).items():
            _, n = normalize_tier(tier)
            if n:
                touched_tiers += 1
                total_changes += n
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    return touched_tiers, total_changes


def main() -> None:
    for name in KID_DECKS:
        path = DATA_DIR / name
        if not path.exists():
            print(f"  skip {name} (missing)")
            continue
        tiers, changes = normalize_deck(path)
        print(f"  {name}: {tiers} tiers touched, {changes} field edits")


if __name__ == "__main__":
    main()
