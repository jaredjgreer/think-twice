#!/usr/bin/env python3
"""Assemble deck JSON from batch files."""
import json, sys, re, glob

def extract_json_array(text):
    """Extract a JSON array from text that may contain markdown or other content."""
    # Strip markdown code fences anywhere
    text = re.sub(r'```(?:json)?', '', text)
    text = text.strip()
    try:
        data = json.loads(text)
        if isinstance(data, list):
            return data
    except:
        pass
    # Find the outermost [ ... ]
    depth = 0
    start = None
    for i, ch in enumerate(text):
        if ch == '[' and start is None:
            start = i
            depth = 1
        elif ch == '[' and start is not None:
            depth += 1
        elif ch == ']' and start is not None:
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start:i+1])
                except:
                    start = None
    return []

def main():
    if len(sys.argv) < 4:
        print("Usage: assemble-deck.py <output.json> <deckName> <deckId> <description> <file1> <file2> ...")
        sys.exit(1)
    
    output_path = sys.argv[1]
    deck_name = sys.argv[2]
    deck_id = sys.argv[3]
    description = sys.argv[4]
    input_files = sys.argv[5:]
    
    all_cards = []
    for f in input_files:
        with open(f, 'r') as fh:
            cards = extract_json_array(fh.read())
            print(f"  {f}: {len(cards)} cards")
            all_cards.extend(cards)
    
    deck = {
        "deckName": deck_name,
        "deckId": deck_id,
        "description": description,
        "cards": all_cards
    }
    
    with open(output_path, 'w') as fh:
        json.dump(deck, fh, indent=2)
    
    print(f"Wrote {len(all_cards)} cards to {output_path}")

if __name__ == '__main__':
    main()
