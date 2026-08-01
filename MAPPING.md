# Reference Mapping

## Purpose

This document was written before the rules to make the adaptation explicit. It identifies the structural jobs performed by *Dune: Imperium – Uprising* and assigns each a Middle-earth counterpart. It is a design map, not a claim of compatibility and not a substitute for either game's rulebook.

The primary references were the publisher-hosted [main rulebook](https://dwd-web.s3.us-west-2.amazonaws.com/pdfs/DUNE_IMPERIUM_UPRISING_Main_Rulebook_23-10-12.pdf) and [rules supplements / board-space guide](https://dwd-web.s3.us-west-2.amazonaws.com/pdfs/DUNE_IMPERIUM_UPRISING_Rules_Supplements_23-10-12.pdf). The source game uses a 10-card starting deck, two starting Agents, three Spies, four faction tracks, a five-card market row, a ten-card conflict sequence, troops worth 2 Strength, and sandworms worth 3 Strength that double battle rewards.

## System map

| Reference function | War for Middle-earth | Design reason |
| --- | --- | --- |
| Victory Points | Renown | A broad measure of political and martial claim |
| Solari | Gold | Institutional and military currency |
| Spice | Mithril | Rare value used for exceptional actions |
| Water | Provisions | Gate on dangerous geographic travel |
| Persuasion | Influence | Temporary card-acquisition power |
| Agents | Agents | Envoys, captains, messengers, or servants |
| Swordmaster / third Agent | Captain of the Host | Permanent action-economy upgrade |
| Council seat | Seat on the White Council | Permanent +2 Influence at Reveal |
| Troops | Companies | All ordinary military cubes; 2 Strength |
| Sandworms | Ents | 3 Strength; immediate deployment; reward doubling |
| Maker Hooks | Ent-draught token | Permanent prerequisite for summoning Ents |
| Shield Wall | Dam of Isengard | Blocks Ents from three settled critical battles |
| Spies | Scouts | Observation-post presence and infiltration |
| Intrigue cards | Fate cards | Plot, Combat, and Endgame surprises |
| Imperium deck/row | Chronicle deck/row | Shared deck-building market |
| Reserve cards | Muster the Host / Deed Worthy of Song | Always-available purchases |
| Conflict cards | Battle cards | Public battle and ranked rewards |
| Battle icons | Standards: Tree, Horse, Star | Pairs on won Battles/Objectives score Renown |
| Control markers | Banners | Ownership of critical locations |
| Makers phase | Riches phase | Unvisited Mithril spaces accumulate |
| CHOAM contracts | War Efforts | Optional public task module |

## Placement-icon map

| Reference icon | New icon | Strategic identity |
| --- | --- | --- |
| Emperor | Shadow Hosts | Gold and efficient military recruitment |
| Spacing Guild | Dwarven Holds | Provisions, Mithril conversion, mass deployment |
| Bene Gesserit | Elven Realms | Fate, card flow, and Scouts |
| Fremen | Wild Kindreds | Deck thinning, fieldcraft, Ent access |
| Landsraad | White Council | Permanent upgrades and political efficiency |
| City | Stronghold | Recruitment, card draw, and critical locations |
| Spice Trade | Roads | Mithril collection and War Efforts |
| Spy | Scout | Access to any space connected to your Scout |

## Board-space map

The numbers deliberately begin close to the reference board so the first prototype has a known economic baseline. Names and spatial relationships should be tested for thematic clarity.

| Reference space | Middle-earth space | Icon | Prototype effect |
| --- | --- | --- | --- |
| Accept Contract | Take Up a War Effort | Roads | Draw 1; take a War Effort, or gain 2 Gold without module |
| Arrakeen | Minas Tirith | Stronghold, battle | Recruit 1 Company; draw 1; controller gains 1 Gold |
| Assembly Hall | Hall of Fire | White Council | Draw 1 Fate; +1 Influence during your Reveal this round |
| Deep Desert | Deep Fangorn | Roads, battle | Pay 3 Provisions; take bonus Mithril, then gain 4 Mithril or summon 2 Ents |
| Deliver Supplies | Dwarven Caravans | Dwarven | +1 Dwarven standing; gain 1 Provision |
| Desert Tactics | Ranger Mustering | Wild, battle | Pay 1 Provision; +1 Wild standing; recruit 1; trash 1 card |
| Dutiful Service | Tribute to the Shadow | Shadow | +1 Shadow standing; War Effort or 2 Gold |
| Espionage | Mirror of Galadriel | Elven | Pay 1 Mithril; +1 Elven standing; draw 1; place 1 Scout |
| Fremkit | Hidden Paths | Wild, battle | +1 Wild standing; draw 1 |
| Gather Support | Muster the Free Peoples | White Council | Recruit 2; optionally pay 2 Gold to gain 1 Provision |
| Hagga Basin | Entwash | Roads, battle | Pay 1 Provision; take bonus Mithril, then gain 2 Mithril or summon 1 Ent |
| Heighliner | Deep Roads | Dwarven, battle | Pay 5 Mithril; +1 Dwarven standing; recruit 5 |
| High Council | Seat on the White Council | White Council | Pay 5 Gold; gain seat; later visits gain 2 Mithril, Fate, recruit 3 |
| Imperial Basin | Edoras | Roads, battle | Gain 1 plus bonus Mithril; controller gains 1 Mithril |
| Imperial Privilege | Secret Bargain | White Council | Need Shadow 2; pay 3 Gold; cycle Fate, recall another Agent, draw 1 |
| Research Station | Archives of Rivendell | Stronghold, battle | Pay 2 Provisions; recruit 2; draw 2 |
| Sardaukar | Pits of Isengard | Shadow | Pay 4 Mithril; +1 Shadow standing; Fate; recruit 4 |
| Secrets | Hidden Counsel | Elven | +1 Elven standing; draw Fate; opponents holding 4+ Fate yield one random |
| Shipping | Great Forge | Roads | Need Dwarven 2; pay 3 Mithril; gain 5 Gold; +1 any faction |
| Sietch Tabr | Fangorn Moot | Stronghold, battle | Need Wild 2; gain Ent-draught + recruit 1 + Provision, or Provision + breach Dam |
| Spice Refinery | Osgiliath | Stronghold, battle | Pay 0/1 Mithril; gain 2/4 Gold; controller gains 1 Gold |
| Swordmaster | Captain of the Host | White Council | Pay 8 Gold, or 6 after any player has one; unlock third Agent |

The reference board and this prototype each present 22 distinct Agent destinations. The exact visual grouping is specified in `BOARD_LAYOUT.md`.

## Deliberate departures from the original outline

### Ordinary units use one value

The outline proposed Levies at 1 Strength and Uruk-hai at 2. That creates an additional acquisition and balance system absent from the reference. In version 0.1 all Companies are worth 2; Uruk-hai appear as Shadow-themed Companies and card effects. A future elite-unit module can be tested independently.

### Ent-draught is persistent

The outline spent one Ent-draught per Ent. Version 0.1 makes it a permanent prerequisite token. Ent opportunities are already expensive, limited to two board spaces, forced immediately into battle, blocked by the Dam, and returned after combat. Adding a consumable tax would delay the strategy beyond usefulness.

### Reward doubling is exact

One or more Ents double the ranked reward a player receives, not every downstream benefit. Control, the Battle card, Standards, and effects triggered by gaining a reward are not doubled.

### No experience or skill tree in the core game

Leveling competes with deck-building and faction influence as a progression system and has no direct reference-game counterpart. Version 0.1 uses two leader abilities only. Experience remains a campaign-mode idea for later testing.

### War Efforts are optional

Contracts are a module in the source and remain modular here. Core games replace “take a War Effort” with 2 Gold.

## Theme stress points to test

- Influence with the Shadow represents fear, leverage, knowledge, or command as much as alliance. This abstraction must be clear enough that heroic leaders using Shadow spaces does not feel absurd.
- Deep Fangorn and Entwash also produce Mithril to preserve the economic map. Art and flavor should frame this as ancient tribute, recovered hoards, and ore from the mountains above—not mining the trees.
- The Dam protects three settled critical locations as a global gameplay gate rather than literal hydrology. Its visual treatment should communicate “Ents cannot pass while intact.”
