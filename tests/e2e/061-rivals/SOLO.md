# Test: Solo Rivals

One isolated human configures a Captain-difficulty solo table, receives two distinct automated opponents and public Objectives, completes an ordinary Reveal, watches every Rival Agent and Battle step resolve, and reloads the deterministic round-two state.

Every numbered frame is captured only after its listed semantic validations pass. The phone and desktop images prove the same gesture at both required viewports.

## Mara enters the solo table name

![Phone: Mara enters the solo table name](./screenshots/000-host-name-phone.png)

![Desktop: Mara enters the solo table name](./screenshots/000-host-name-desktop.png)

**Verifications:**

- [x] The local identity is retained

---

## Mara enters a private solo room code

![Phone: Mara enters a private solo room code](./screenshots/001-host-code-phone.png)

![Desktop: Mara enters a private solo room code](./screenshots/001-host-code-desktop.png)

**Verifications:**

- [x] The exact private invitation is visible

---

## Mara creates the solo room

![Phone: Mara creates the solo room](./screenshots/002-create-room-phone.png)

![Desktop: Mara creates the solo room](./screenshots/002-create-room-desktop.png)

**Verifications:**

- [x] The requested room opens
- [x] 1 accepted events replay with no diagnostics

---

## Mara selects one human against two Rivals

![Phone: Mara selects one human against two Rivals](./screenshots/003-choose-solo-phone.png)

![Desktop: Mara selects one human against two Rivals](./screenshots/003-choose-solo-desktop.png)

**Verifications:**

- [x] The lobby publishes the solo format and Captain difficulty
- [x] 2 accepted events replay with no diagnostics

---

## Mara selects Aragorn

![Phone: Mara selects Aragorn](./screenshots/004-choose-commander-phone.png)

![Desktop: Mara selects Aragorn](./screenshots/004-choose-commander-desktop.png)

**Verifications:**

- [x] Aragorn is the unique selected human identity
- [x] 3 accepted events replay with no diagnostics

---

## Mara readies the solo table

![Phone: Mara readies the solo table](./screenshots/005-ready-phone.png)

![Desktop: Mara readies the solo table](./screenshots/005-ready-desktop.png)

**Verifications:**

- [x] One ready human satisfies the solo player count
- [x] 4 accepted events replay with no diagnostics

---

## Mara publishes the Rival seed

![Phone: Mara publishes the Rival seed](./screenshots/006-seed-phone.png)

![Desktop: Mara publishes the Rival seed](./screenshots/006-seed-desktop.png)

**Verifications:**

- [x] The deterministic seed is visible

---

## Mara starts the solo match

![Phone: Mara starts the solo match](./screenshots/007-start-phone.png)

![Desktop: Mara starts the solo match](./screenshots/007-start-desktop.png)

**Verifications:**

- [x] The board shows one human and two distinct public Rival profiles
- [x] All three participants have a public Objective and the shared action deck is visible
- [x] 5 accepted events replay with no diagnostics

---

## Mara Reveals instead of placing an Agent

![Phone: Mara Reveals instead of placing an Agent](./screenshots/008-reveal-phone.png)

![Desktop: Mara Reveals instead of placing an Agent](./screenshots/008-reveal-desktop.png)

**Verifications:**

- [x] The ordinary human Reveal remains interactive
- [x] 6 accepted events replay with no diagnostics

---

## Mara finishes Reveal and the Rivals complete the round automatically

![Phone: Mara finishes Reveal and the Rivals complete the round automatically](./screenshots/009-finish-round-phone.png)

![Desktop: Mara finishes Reveal and the Rivals complete the round automatically](./screenshots/009-finish-round-desktop.png)

**Verifications:**

- [x] Both Rivals use their ready Agents, skip Reveal and resolve Battle without synthetic client events
- [x] 7 accepted events replay with no diagnostics

---

## Mara reloads the automated round

![Phone: Mara reloads the automated round](./screenshots/010-reload-phone.png)

![Desktop: Mara reloads the automated round](./screenshots/010-reload-desktop.png)

**Verifications:**

- [x] Immutable replay restores the same round, profiles, resources, Objectives and action deck
- [x] 7 accepted events replay with no diagnostics

---
