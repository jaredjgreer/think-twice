import json

data = open('data/drugdev-mastery.json').read()

# The file has lines in reverse order. Reverse them.
lines = data.split('\n')
reversed_lines = lines[::-1]
clean = '\n'.join(reversed_lines)

# Try parsing as-is
try:
    parsed = json.loads(clean)
    print(f"Direct reverse parse worked! Type: {type(parsed)}")
    if isinstance(parsed, list):
        print(f"Array of {len(parsed)} items")
        # Flatten if nested
        cards = []
        for item in parsed:
            if isinstance(item, list):
                cards.extend(item)
            else:
                cards.append(item)
        print(f"Total cards after flattening: {len(cards)}")
    elif isinstance(parsed, dict) and 'cards' in parsed:
        cards = parsed['cards']
        print(f"Deck with {len(cards)} cards")
    
    if len(cards) == 40:
        deck = {
            "deckName": "Drug Development Mastery",
            "deckId": "drugdev-mastery",
            "description": "Advanced drug development strategy: clinical program design, regulatory negotiation, pipeline valuation, and executive decision-making.",
            "cards": cards
        }
        with open('data/drugdev-mastery.json', 'w') as f:
            json.dump(deck, f, indent=2)
        print("Rebuilt drugdev-mastery.json with 40 cards!")
    else:
        print(f"Expected 40 cards, got {len(cards)}")
except json.JSONDecodeError as e:
    print(f"Reverse parse failed: {e}")
    # Try stripping leading/trailing bracket noise
    stripped = clean.strip()
    print(f"Starts with: {repr(stripped[:20])}")
    print(f"Ends with: {repr(stripped[-20:])}")
