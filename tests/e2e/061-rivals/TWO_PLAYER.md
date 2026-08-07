# Test: Two-player Rival

Two isolated humans configure a shared Rival, start in deterministic human–Rival–human order, finish the first human Reveal, observe exactly one automatic middle-seat action, and reload the second human’s authority.

Every numbered frame is captured only after its listed semantic validations pass. The phone and desktop images prove the same gesture at both required viewports.

## Mara enters the two-player table name

![Phone: Mara enters the two-player table name](./screenshots/000-two-host-name-phone.png)

![Desktop: Mara enters the two-player table name](./screenshots/000-two-host-name-desktop.png)

**Verifications:**

- [x] The host identity is retained

---

## Mara enters the two-player invitation

![Phone: Mara enters the two-player invitation](./screenshots/001-two-host-code-phone.png)

![Desktop: Mara enters the two-player invitation](./screenshots/001-two-host-code-desktop.png)

**Verifications:**

- [x] The invitation is exact

---

## Mara creates the room

![Phone: Mara creates the room](./screenshots/002-two-create-phone.png)

![Desktop: Mara creates the room](./screenshots/002-two-create-desktop.png)

**Verifications:**

- [x] The host room opens
- [x] Both isolated humans replay 1 accepted events with no diagnostics

---

## Rin joins from an isolated browser

![Phone: Rin joins from an isolated browser](./screenshots/003-two-join-phone.png)

![Desktop: Rin joins from an isolated browser](./screenshots/003-two-join-desktop.png)

**Verifications:**

- [x] Both humans see both lobby seats
- [x] Both isolated humans replay 2 accepted events with no diagnostics

---

## Mara seats one Rival between the humans

![Phone: Mara seats one Rival between the humans](./screenshots/004-two-choose-format-phone.png)

![Desktop: Mara seats one Rival between the humans](./screenshots/004-two-choose-format-desktop.png)

**Verifications:**

- [x] Both lobbies publish the two-human Rival format
- [x] Both isolated humans replay 3 accepted events with no diagnostics

---

## Mara selects Aragorn

![Phone: Mara selects Aragorn](./screenshots/005-two-commander-1-phone.png)

![Desktop: Mara selects Aragorn](./screenshots/005-two-commander-1-desktop.png)

**Verifications:**

- [x] The selected Commander is public and unique
- [x] Both isolated humans replay 4 accepted events with no diagnostics

---

## Mara readies

![Phone: Mara readies](./screenshots/006-two-ready-1-phone.png)

![Desktop: Mara readies](./screenshots/006-two-ready-1-desktop.png)

**Verifications:**

- [x] Readiness converges in both lobbies
- [x] Both isolated humans replay 5 accepted events with no diagnostics

---

## Rin selects Treebeard

![Phone: Rin selects Treebeard](./screenshots/007-two-commander-2-phone.png)

![Desktop: Rin selects Treebeard](./screenshots/007-two-commander-2-desktop.png)

**Verifications:**

- [x] The selected Commander is public and unique
- [x] Both isolated humans replay 6 accepted events with no diagnostics

---

## Rin readies

![Phone: Rin readies](./screenshots/008-two-ready-2-phone.png)

![Desktop: Rin readies](./screenshots/008-two-ready-2-desktop.png)

**Verifications:**

- [x] Readiness converges in both lobbies
- [x] Both isolated humans replay 7 accepted events with no diagnostics

---

## Mara starts the two-player Rival match

![Phone: Mara starts the two-player Rival match](./screenshots/009-two-start-phone.png)

![Desktop: Mara starts the two-player Rival match](./screenshots/009-two-start-desktop.png)

**Verifications:**

- [x] Both clients show exactly two humans and one shared Rival
- [x] Both isolated humans replay 8 accepted events with no diagnostics

---

## Mara Reveals first

![Phone: Mara Reveals first](./screenshots/010-two-first-reveal-phone.png)

![Desktop: Mara Reveals first](./screenshots/010-two-first-reveal-desktop.png)

**Verifications:**

- [x] The first human keeps authority through their ordinary Reveal
- [x] Both isolated humans replay 9 accepted events with no diagnostics

---

## Mara finishes and the middle Rival acts once

![Phone: Mara finishes and the middle Rival acts once](./screenshots/011-two-first-finish-phone.png)

![Desktop: Mara finishes and the middle Rival acts once](./screenshots/011-two-first-finish-desktop.png)

**Verifications:**

- [x] Turn authority advances through the automated middle seat to the other human
- [x] Exactly one Rival Agent is visibly committed before the second human acts
- [x] Both isolated humans replay 10 accepted events with no diagnostics

---

## Rin reloads at the alternating seat boundary

![Phone: Rin reloads at the alternating seat boundary](./screenshots/012-two-reload-middle-phone.png)

![Desktop: Rin reloads at the alternating seat boundary](./screenshots/012-two-reload-middle-desktop.png)

**Verifications:**

- [x] Replay retains the Rival occupation and second-human authority
- [x] Both isolated humans replay 10 accepted events with no diagnostics

---
