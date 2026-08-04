# Test: Chronicle market tracer

Three isolated human browsers keep a five-card public Chronicle Row on the production board, Reveal for Influence, acquire one exact physical card, refill immediately, reload the market, perform a genuine discard reshuffle, draw the acquired Rider, and execute both of its final card boxes through visible controls.

Every numbered frame is captured only after its listed semantic validations pass. The phone and desktop images prove the same gesture at both required viewports.

## Mara enters a table name

![Phone: Mara enters a table name](./screenshots/000-host-name-phone.png)

![Desktop: Mara enters a table name](./screenshots/000-host-name-desktop.png)

**Verifications:**

- [x] The real lobby accepts the host name

---

## Mara enters the Plot Fate room code

![Phone: Mara enters the Plot Fate room code](./screenshots/001-host-code-phone.png)

![Desktop: Mara enters the Plot Fate room code](./screenshots/001-host-code-desktop.png)

**Verifications:**

- [x] The exact invitation is visible

---

## Mara creates the Firebase room

![Phone: Mara creates the Firebase room](./screenshots/002-create-room-phone.png)

![Desktop: Mara creates the Firebase room](./screenshots/002-create-room-desktop.png)

**Verifications:**

- [x] The requested room opens
- [x] Every connected browser replays 1 accepted events with no diagnostics

---

## Rin enters a table name

![Phone: Rin enters a table name](./screenshots/003-guest-1-name-phone.png)

![Desktop: Rin enters a table name](./screenshots/003-guest-1-name-desktop.png)

**Verifications:**

- [x] The isolated browser retains the name

---

## Rin enters the invitation

![Phone: Rin enters the invitation](./screenshots/004-guest-1-code-phone.png)

![Desktop: Rin enters the invitation](./screenshots/004-guest-1-code-desktop.png)

**Verifications:**

- [x] The isolated browser uses the shared invitation

---

## Rin joins the room

![Phone: Rin joins the room](./screenshots/005-guest-1-join-phone.png)

![Desktop: Rin joins the room](./screenshots/005-guest-1-join-desktop.png)

**Verifications:**

- [x] Every connected lobby sees the joined seat
- [x] Every connected browser replays 2 accepted events with no diagnostics

---

## Pip enters a table name

![Phone: Pip enters a table name](./screenshots/006-guest-2-name-phone.png)

![Desktop: Pip enters a table name](./screenshots/006-guest-2-name-desktop.png)

**Verifications:**

- [x] The isolated browser retains the name

---

## Pip enters the invitation

![Phone: Pip enters the invitation](./screenshots/007-guest-2-code-phone.png)

![Desktop: Pip enters the invitation](./screenshots/007-guest-2-code-desktop.png)

**Verifications:**

- [x] The isolated browser uses the shared invitation

---

## Pip joins the room

![Phone: Pip joins the room](./screenshots/008-guest-2-join-phone.png)

![Desktop: Pip joins the room](./screenshots/008-guest-2-join-desktop.png)

**Verifications:**

- [x] Every connected lobby sees the joined seat
- [x] Every connected browser replays 3 accepted events with no diagnostics

---

## Mara selects Aragorn

![Phone: Mara selects Aragorn](./screenshots/009-commander-1-phone.png)

![Desktop: Mara selects Aragorn](./screenshots/009-commander-1-desktop.png)

**Verifications:**

- [x] The unique identity is public
- [x] Every connected browser replays 4 accepted events with no diagnostics

---

## Mara readies

![Phone: Mara readies](./screenshots/010-ready-1-phone.png)

![Desktop: Mara readies](./screenshots/010-ready-1-desktop.png)

**Verifications:**

- [x] Every observer sees the ready state
- [x] Every connected browser replays 5 accepted events with no diagnostics

---

## Rin selects Galadriel

![Phone: Rin selects Galadriel](./screenshots/011-commander-2-phone.png)

![Desktop: Rin selects Galadriel](./screenshots/011-commander-2-desktop.png)

**Verifications:**

- [x] The unique identity is public
- [x] Every connected browser replays 6 accepted events with no diagnostics

---

## Rin readies

![Phone: Rin readies](./screenshots/012-ready-2-phone.png)

![Desktop: Rin readies](./screenshots/012-ready-2-desktop.png)

**Verifications:**

- [x] Every observer sees the ready state
- [x] Every connected browser replays 7 accepted events with no diagnostics

---

## Pip selects Gandalf

![Phone: Pip selects Gandalf](./screenshots/013-commander-3-phone.png)

![Desktop: Pip selects Gandalf](./screenshots/013-commander-3-desktop.png)

**Verifications:**

- [x] The unique identity is public
- [x] Every connected browser replays 8 accepted events with no diagnostics

---

## Pip readies

![Phone: Pip readies](./screenshots/014-ready-3-phone.png)

![Desktop: Pip readies](./screenshots/014-ready-3-desktop.png)

**Verifications:**

- [x] Every observer sees the ready state
- [x] Every connected browser replays 9 accepted events with no diagnostics

---

## Mara enters the published Plot Fate seed

![Phone: Mara enters the published Plot Fate seed](./screenshots/015-plot-seed-phone.png)

![Desktop: Mara enters the published Plot Fate seed](./screenshots/015-plot-seed-desktop.png)

**Verifications:**

- [x] The deterministic seed is visible

---

## Mara starts the Plot Fate match

![Phone: Mara starts the Plot Fate match](./screenshots/016-start-match-phone.png)

![Desktop: Mara starts the Plot Fate match](./screenshots/016-start-match-desktop.png)

**Verifications:**

- [x] Every human reaches the complete production board
- [x] Every connected browser replays 10 accepted events with no diagnostics

---

## Rin Reveals for the Chronicle market

![Phone: Rin Reveals for the Chronicle market](./screenshots/017-reveal-for-market-phone.png)

![Desktop: Rin Reveals for the Chronicle market](./screenshots/017-reveal-for-market-desktop.png)

**Verifications:**

- [x] The public Muster row computes enough Influence for a two-cost card
- [x] Only the active Revealing player can acquire the shared card
- [x] Every connected browser replays 11 accepted events with no diagnostics

---

## Rin buys Rider of Rohan

![Phone: Rin buys Rider of Rohan](./screenshots/018-buy-rider-phone.png)

![Desktop: Rin buys Rider of Rohan](./screenshots/018-buy-rider-desktop.png)

**Verifications:**

- [x] The exact physical card enters the buyer’s discard and costs 2 Influence
- [x] The Chronicle Row immediately refills to five from its eight-card deck
- [x] Every connected browser replays 12 accepted events with no diagnostics

---

## Rin reloads after the market refill

![Phone: Rin reloads after the market refill](./screenshots/019-reload-acquired-market-phone.png)

![Desktop: Rin reloads after the market refill](./screenshots/019-reload-acquired-market-desktop.png)

**Verifications:**

- [x] Immutable replay preserves the exact refill, Influence, and acquired discard count
- [x] Every connected browser replays 12 accepted events with no diagnostics

---

## Rin finishes the acquisition Reveal

![Phone: Rin finishes the acquisition Reveal](./screenshots/020-finish-buying-phone.png)

![Desktop: Rin finishes the acquisition Reveal](./screenshots/020-finish-buying-desktop.png)

**Verifications:**

- [x] The acquired card remains in discard while the turn passes
- [x] Every connected browser replays 13 accepted events with no diagnostics

---

## Pip Reveals while the acquired Rider waits for reshuffle

![Phone: Pip Reveals while the acquired Rider waits for reshuffle](./screenshots/021-cycle-1-reveal-phone.png)

![Desktop: Pip Reveals while the acquired Rider waits for reshuffle](./screenshots/021-cycle-1-reveal-desktop.png)

**Verifications:**

- [x] The genuine public Muster row replaces the private hand
- [x] Every connected browser replays 14 accepted events with no diagnostics

---

## Pip finishes that Reveal

![Phone: Pip finishes that Reveal](./screenshots/022-cycle-1-finish-phone.png)

![Desktop: Pip finishes that Reveal](./screenshots/022-cycle-1-finish-desktop.png)

**Verifications:**

- [x] The Reveal closes and ordinary turn order continues
- [x] Every connected browser replays 15 accepted events with no diagnostics

---

## Mara Reveals while the acquired Rider waits for reshuffle

![Phone: Mara Reveals while the acquired Rider waits for reshuffle](./screenshots/023-cycle-2-reveal-phone.png)

![Desktop: Mara Reveals while the acquired Rider waits for reshuffle](./screenshots/023-cycle-2-reveal-desktop.png)

**Verifications:**

- [x] The genuine public Muster row replaces the private hand
- [x] Every connected browser replays 16 accepted events with no diagnostics

---

## Mara finishes that Reveal

![Phone: Mara finishes that Reveal](./screenshots/024-cycle-2-finish-phone.png)

![Desktop: Mara finishes that Reveal](./screenshots/024-cycle-2-finish-desktop.png)

**Verifications:**

- [x] The Reveal closes and ordinary turn order continues
- [x] Every connected browser replays 17 accepted events with no diagnostics

---

## Pip Reveals while the acquired Rider waits for reshuffle

![Phone: Pip Reveals while the acquired Rider waits for reshuffle](./screenshots/025-cycle-3-reveal-phone.png)

![Desktop: Pip Reveals while the acquired Rider waits for reshuffle](./screenshots/025-cycle-3-reveal-desktop.png)

**Verifications:**

- [x] The genuine public Muster row replaces the private hand
- [x] Every connected browser replays 18 accepted events with no diagnostics

---

## Pip finishes that Reveal

![Phone: Pip finishes that Reveal](./screenshots/026-cycle-3-finish-phone.png)

![Desktop: Pip finishes that Reveal](./screenshots/026-cycle-3-finish-desktop.png)

**Verifications:**

- [x] The Reveal closes and ordinary turn order continues
- [x] Every connected browser replays 19 accepted events with no diagnostics

---

## Mara Reveals while the acquired Rider waits for reshuffle

![Phone: Mara Reveals while the acquired Rider waits for reshuffle](./screenshots/027-cycle-4-reveal-phone.png)

![Desktop: Mara Reveals while the acquired Rider waits for reshuffle](./screenshots/027-cycle-4-reveal-desktop.png)

**Verifications:**

- [x] The genuine public Muster row replaces the private hand
- [x] Every connected browser replays 20 accepted events with no diagnostics

---

## Mara finishes that Reveal

![Phone: Mara finishes that Reveal](./screenshots/028-cycle-4-finish-phone.png)

![Desktop: Mara finishes that Reveal](./screenshots/028-cycle-4-finish-desktop.png)

**Verifications:**

- [x] The Reveal closes and ordinary turn order continues
- [x] Every connected browser replays 21 accepted events with no diagnostics

---

## Rin Reveals while the acquired Rider waits for reshuffle

![Phone: Rin Reveals while the acquired Rider waits for reshuffle](./screenshots/029-cycle-5-reveal-phone.png)

![Desktop: Rin Reveals while the acquired Rider waits for reshuffle](./screenshots/029-cycle-5-reveal-desktop.png)

**Verifications:**

- [x] The genuine public Muster row replaces the private hand
- [x] Every connected browser replays 22 accepted events with no diagnostics

---

## Rin finishes that Reveal

![Phone: Rin finishes that Reveal](./screenshots/030-cycle-5-finish-phone.png)

![Desktop: Rin finishes that Reveal](./screenshots/030-cycle-5-finish-desktop.png)

**Verifications:**

- [x] The second Recall opens Round 3 after the acquired discard was shuffled
- [x] Every connected browser replays 23 accepted events with no diagnostics

---

## Mara Reveals before the Chronicle buyer in Round 3

![Phone: Mara Reveals before the Chronicle buyer in Round 3](./screenshots/031-round-three-1-reveal-phone.png)

![Desktop: Mara Reveals before the Chronicle buyer in Round 3](./screenshots/031-round-three-1-reveal-desktop.png)

**Verifications:**

- [x] Rotated first-player order remains visible and authoritative
- [x] Every connected browser replays 24 accepted events with no diagnostics

---

## Mara finishes before the Chronicle buyer

![Phone: Mara finishes before the Chronicle buyer](./screenshots/032-round-three-1-finish-phone.png)

![Desktop: Mara finishes before the Chronicle buyer](./screenshots/032-round-three-1-finish-desktop.png)

**Verifications:**

- [x] The next ordinary human receives authority
- [x] Every connected browser replays 25 accepted events with no diagnostics

---

## Rin selects the acquired Rider of Rohan

![Phone: Rin selects the acquired Rider of Rohan](./screenshots/033-select-acquired-rider-phone.png)

![Desktop: Rin selects the acquired Rider of Rohan](./screenshots/033-select-acquired-rider-desktop.png)

**Verifications:**

- [x] The final Stronghold placement icons enable real Stronghold destinations

---

## Rin rides to Minas Tirith

![Phone: Rin rides to Minas Tirith](./screenshots/034-ride-to-minas-tirith-phone.png)

![Desktop: Rin rides to Minas Tirith](./screenshots/034-ride-to-minas-tirith-desktop.png)

**Verifications:**

- [x] Rider and Minas Tirith each recruit one Company before deployment
- [x] The ordered Battle deployment choice remains with the buyer
- [x] Every connected browser replays 26 accepted events with no diagnostics

---

## Rin reloads during the Rider deployment

![Phone: Rin reloads during the Rider deployment](./screenshots/035-reload-rider-deployment-phone.png)

![Desktop: Rin reloads during the Rider deployment](./screenshots/035-reload-rider-deployment-desktop.png)

**Verifications:**

- [x] The acquired card’s Journey result and exact pending authority survive replay
- [x] Every connected browser replays 26 accepted events with no diagnostics

---

## Rin keeps the recruited Companies in garrison

![Phone: Rin keeps the recruited Companies in garrison](./screenshots/036-decline-rider-deployment-phone.png)

![Desktop: Rin keeps the recruited Companies in garrison](./screenshots/036-decline-rider-deployment-desktop.png)

**Verifications:**

- [x] The complete acquired-card Agent turn resolves and passes to the next human
- [x] Every connected browser replays 27 accepted events with no diagnostics

---
