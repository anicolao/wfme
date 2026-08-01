# Vision

## North star

Build a digital implementation of a deeply themed, legible, and balanced strategy board game in which every hand asks a meaningful question: travel, bargain, prepare, or commit to war?

The final game should feel as though a map of Middle-earth has become a web of political and logistical opportunities. A player should tell a story through play—Galadriel establishing distant foresight, Saruman converting wealth into armies, Aragorn gathering scattered allies—without any strategy becoming predetermined by leader choice.

## Product promise

The game offers:

- tense worker placement where a blocked destination matters but never ends all planning;
- deck-building in which purchased cards change both where a player may act and how strongly they reveal;
- one shared battle each round, creating readable stakes and opportunities for bluffing;
- asymmetric leaders that bend the common rules without replacing them;
- a map whose economy communicates geography: Provisions open hard roads, Mithril buys exceptional action, and Gold unlocks institutions;
- spectacular but answerable Ent turns whose reward doubling is earned through visible setup;
- a complete match in roughly two hours, with a natural ten-round ceiling.

## Design pillars

### Theme explains rules

Players should infer what a space does from its name, placement, and art. Strongholds muster troops. The White Council converts wealth into permanent political capacity. Dwarven routes turn Mithril into sudden deployment. Fangorn grants access to Ents. If a mechanic cannot be explained through the fiction, either its fiction or its rule must change.

### Tension before arithmetic

The central pleasure is deciding when to reveal intentions. Scouts threaten infiltration. Hidden Fate cards keep combat uncertain. Public troop commitments make escalation legible. The game should reward reading opponents more than memorizing a dominant conversion ratio.

### Asymmetry without solitaire

Leaders point toward strategies but must still contest the same board, market, influence tracks, and battles. No leader receives a private minigame that other players cannot disrupt.

### Strong effects need visible gates

Ents, third Agents, Council seats, and high-tier faction spaces are powerful. Their prerequisites are public and expensive enough that opponents can respond. Surprise belongs in Fate cards, not in untelegraphed engines that decide the game.

### Digital-native, tabletop-honest

The long-term implementation should automate bookkeeping, rules enforcement, animation, online play, and AI opponents while retaining the clarity of a physical board. Every digital action must correspond to a rule that could be executed at a table. The digital client is not permission to hide unexplained state.

## Player experience targets

- On a first play, a player understands the round after two rounds and can identify at least two plausible destinations on most Agent turns.
- By a third play, players recognize leader synergies and deliberately thin or specialize their decks.
- Expert play centers on timing, market adaptation, Scout geometry, and battle valuation—not rote opening scripts.
- Losing players still make consequential choices late in the game through battle-icon pairs, alliances, and hidden endgame Fate cards.

## Balance targets

These are hypotheses for playtesting, not claims:

- First-seat win rate between 22% and 28% in four-player games.
- No leader outside a 45%–55% head-to-head-equivalent performance band after at least 100 logged games per matchup cluster.
- Median game length: 8–9 rounds; fewer than 15% of games reach the empty Battle deck.
- The winner averages 2–4 Renown from battles, 1–3 from factions, and 0–2 from other sources.
- Ents appear in 40%–70% of games but decide fewer than one quarter of games by themselves.
- A player who never gains a third Agent can win, but doing so should be strategically exceptional rather than obviously incorrect.

## Roadmap

### Phase 1 — Paper rules

Validate the board economy, standard deck, leader abilities, battles, Scouts, Dam, and Ents using text-only components.

### Phase 2 — Content stability

Tune the Chronicle, Fate, Battle, and War Effort catalogs. Replace ambiguous wording with a controlled rules vocabulary. Add blind external playtests.

### Phase 3 — Digital vertical slice

Implement one complete 3–4 player match locally with deterministic rules resolution, action logs, undo before hidden information, and a basic rules-reference interface.

### Phase 4 — Networked product

Add asynchronous and live multiplayer, reconnection, matchmaking, accessibility settings, replays, and telemetry that players explicitly opt into.

### Phase 5 — Durable game

Add competent AI, tutorials, challenge scenarios, balance patches, cosmetic polish, and—only after the core game is healthy—solo and team modes.

## Licensing boundary

This repository is a fan-design prototype. A public commercial release would require replacing or licensing protected names, characters, locations, and setting elements, and independently reviewing the relationship to the reference game's protected expression. The rules architecture should therefore remain separable from names, art, and audiovisual assets.
