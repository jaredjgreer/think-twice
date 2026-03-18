import json, os

base = os.path.expanduser(
    "~/Library/Application Support/Code/User/workspaceStorage/"
    "652da1496fcef8e1daf1b53c2345ed3b/GitHub.copilot-chat/"
    "chat-session-resources/1547fed2-a1e5-4c8a-aad2-daef4baf5e23"
)

def load_batch(suffix):
    dirname = [d for d in os.listdir(base) if d.endswith(suffix)][0]
    f = os.path.join(base, dirname, "content.txt")
    with open(f) as fh:
        text = fh.read().strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            if text.rstrip().endswith("```"):
                text = text.rstrip()[:-3]
        return json.loads(text)

# Drug Dev Foundations
suffixes = ["vscode-1773859781017", "vscode-1773859781018", "vscode-1773859781019", "vscode-1773859781020"]
cards = []
for s in suffixes:
    batch = load_batch(s)
    print(f"  {s}: {len(batch)} cards, first={batch[0]['id']}")
    cards.extend(batch)
print(f"Drug Dev Mechanics total: {len(cards)}")
with open("data/drugdev-mechanics.json", "w") as out:
    json.dump({"deckName": "Drug Development Mechanics", "deckId": "drugdev-mechanics",
               "description": "Drug development processes: trial design, manufacturing, regulatory submissions, and quality systems.",
               "cards": cards}, out, indent=2)
print("Written!")
