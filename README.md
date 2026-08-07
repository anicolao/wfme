# The War for Middle-earth

*The War for Middle-earth* is an unofficial, non-commercial strategy-game concept about uncertain alliances, hard journeys, secret designs, and armies committed at exactly the right moment. It combines deck-building with agent placement and a contested battle at the end of every round.

This prototype is mechanically inspired by *Dune: Imperium – Uprising*, but its terminology, setting logic, content, and presentation are developed here as an original fan-design exercise. It is not affiliated with, endorsed by, or licensed by Middle-earth Enterprises, the Tolkien Estate, Dire Wolf Digital, or Legendary Entertainment. No generated art in this repository depicts film actors or reproduces published game art.

## Start here

- [VISION.md](VISION.md) states the long-term product and design goals.
- [CONCEPT.md](CONCEPT.md) is the rewritten high-level pitch from the original `wfme.txt`.
- [MAPPING.md](MAPPING.md) records how the reference game's systems and board spaces translate into this setting.
- [RULES.md](RULES.md) is the complete multiplayer prototype ruleset.
- [CARD_CATALOG.md](CARD_CATALOG.md) defines starting cards, leaders, market cards, Fate cards, battles, and War Efforts.
- [BOARD_LAYOUT.md](BOARD_LAYOUT.md) is the production/layout specification for the board.
- [RIVALS.md](RIVALS.md) adds automated opponents for solo and two-player games.
- [ART_DIRECTION.md](ART_DIRECTION.md) records the visual language and generated-asset prompts.
- [assets/README.md](assets/README.md) inventories the image assets.
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) sequences the responsive digital game as vertical slices.
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) is the honest capability ledger for the current construction build.
- [TECHNICAL_DESIGN.md](TECHNICAL_DESIGN.md) defines deterministic state, events, privacy, and responsive rendering.
- [E2E_TESTING.md](E2E_TESTING.md) defines the browser-test, accessibility, and viewport contract.
- [E2E_GUIDE.md](E2E_GUIDE.md) is the short contributor checklist for passing E2E locally and in CI.
- [DEVELOPMENT.md](DEVELOPMENT.md) defines the Nix-first repeatable development and verification environment.

## Current specification scope

Version `0.1` is a paper-prototype specification for 1–4 players, about 45 minutes per player, ages 14+. The 3–4 player competitive game is the foundation; automated Rivals fill the board at one or two players. Six-player team play is intentionally deferred until the core economy and combat loop are stable.

The rules target a ten-round maximum and a 10 Renown endgame threshold. The included catalog has shared starting decks, eight asymmetric leaders, a 54-card Chronicle deck, a 30-card Fate deck, 16 Battle cards, and 12 optional War Efforts.

## Prototype priorities

1. Print plain text cards and use cubes before investing in finished component design.
2. Test whether the seven normal placement icons are equally reachable from a five-card hand.
3. Measure Ent frequency, doubled rewards, and Dam breach timing.
4. Measure the value of Scouts at every observation post.
5. Tune card and board-space numbers without changing several systems at once.

The generated images are mood and composition targets, not print-ready production files. Labels and iconography should be typeset separately during graphic design.

## Play the construction build

The root URL is the actual game lobby. The playable alpha supports one to four humans through three formats: one human against two automated Rivals, two humans with one Rival, or the three-to-four-human competitive game. It includes unique Commander identities, all sixteen printed Commander powers, four public Objectives, deterministic setup, and private starting hands on the production board. All 22 board destinations, all nine Scout posts, all 16 Battles, both finite Reserve cards, all 54 Chronicle instances across 27 definitions, all 30 Fate instances, all 12 optional War Efforts, four Rival profiles, four difficulty settings, and the shared 22-card Rival action deck are live. The implemented economy includes every faction and White Council destination, standing rewards, Alliances, ordered choices, deck changes, and finite pieces. Combat includes deployment, private Fate effects, Rival escalation, ranked rewards and conversions, ties, Objective/Battle Standard pairing, critical-location control, and cleanup. Riches, Ent-draught, the Dam, Ent summoning, Reveal and acquisition, War Effort timing, Endgame, match history, rematches, and immutable replay are all executable.

Privacy follows a trusted-table model. The interface and its seat-safe rendering projection hide hands, Fate, deck order, and unrevealed choices from other seats, but every signed-in client receives the shared immutable event stream and can inspect it outside the interface. Room codes are invitations, not an authorization or adversarial-secrecy boundary. Play only with participants you trust.

This is a complete-rules playable alpha. Production hardening and broader accessibility/device coverage remain tracked in [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).

To play locally against the Auth and Firestore emulators:

```sh
nix develop --command bun install --frozen-lockfile
nix develop --command bun run emulators
```

In a second terminal run `nix develop --command bun run dev`, open `http://127.0.0.1:5189/` in three separate browser profiles or private contexts, and create/join the same room. The retained PR preview uses the live Firebase project and needs no local setup.

Run every local gate with:

```sh
nix develop --command bun run verify:change
```

The Linux workflow and the separate `E2E tests (macOS)` workflow are independent
required checks: Linux runs static/unit/build verification, while macOS runs the
complete Playwright gate and owns future visual baselines. No check is skipped.
See [E2E_GUIDE.md](E2E_GUIDE.md) for the exact local command and review rules.

The deployment workflow publishes each same-repository pull request with the live Firebase configuration as a retained
GitHub Pages preview at `https://anicolao.github.io/wfme/pr<N>/` and links it from
the PR conversation. A push to `main` publishes the production site at
`https://anicolao.github.io/wfme/`. Fork pull requests are fully verified but are
not deployed because they cannot safely receive the repository write token.

## Visual direction

![Board key art: an original painted high-fantasy campaign map](assets/board/board-key-art.png)

![Board layout concept with faction courts, map, council, roads, and battle arena](assets/board/board-layout-concept.png)
