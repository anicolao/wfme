# Test: Three-player Dwarven Caravans tracer

Three isolated human browser sessions create and join a Firebase room, choose power-free Commander identities, start a seeded game on the final board, resolve one legal Agent action, converge, and replay it after reload.

Every numbered frame is captured only after its listed semantic validations pass. The phone and desktop images prove the same gesture at both required viewports.

## Mara enters a table name

![Phone: Mara enters a table name](./screenshots/000-host-name-phone.png)

![Desktop: Mara enters a table name](./screenshots/000-host-name-desktop.png)

**Verifications:**

- [x] The entered name is visible and the create action remains available

---

## Mara chooses a private invitation code

![Phone: Mara chooses a private invitation code](./screenshots/001-host-room-code-phone.png)

![Desktop: Mara chooses a private invitation code](./screenshots/001-host-room-code-desktop.png)

**Verifications:**

- [x] The five-character code is entered through the real lobby control

---

## Mara creates the shared room

![Phone: Mara creates the shared room](./screenshots/002-create-room-phone.png)

![Desktop: Mara creates the shared room](./screenshots/002-create-room-desktop.png)

**Verifications:**

- [x] The requested invitation code is displayed
- [x] All connected seats converge on 1 public player
- [x] Every connected replay has accepted exactly 1 events with no diagnostics

---

## Rin enters a table name

![Phone: Rin enters a table name](./screenshots/003-guest-1-name-phone.png)

![Desktop: Rin enters a table name](./screenshots/003-guest-1-name-desktop.png)

**Verifications:**

- [x] Rin's name is visible

---

## Rin enters the room code

![Phone: Rin enters the room code](./screenshots/004-guest-1-code-phone.png)

![Desktop: Rin enters the room code](./screenshots/004-guest-1-code-desktop.png)

**Verifications:**

- [x] The exact host invitation code is entered

---

## Rin joins from an independent browser

![Phone: Rin joins from an independent browser](./screenshots/005-guest-1-join-phone.png)

![Desktop: Rin joins from an independent browser](./screenshots/005-guest-1-join-desktop.png)

**Verifications:**

- [x] Rin receives a real seat in the room
- [x] All connected seats converge on 2 public players
- [x] Every connected replay has accepted exactly 2 events with no diagnostics

---

## Pip enters a table name

![Phone: Pip enters a table name](./screenshots/006-guest-2-name-phone.png)

![Desktop: Pip enters a table name](./screenshots/006-guest-2-name-desktop.png)

**Verifications:**

- [x] Pip's name is visible

---

## Pip enters the room code

![Phone: Pip enters the room code](./screenshots/007-guest-2-code-phone.png)

![Desktop: Pip enters the room code](./screenshots/007-guest-2-code-desktop.png)

**Verifications:**

- [x] The exact host invitation code is entered

---

## Pip joins from an independent browser

![Phone: Pip joins from an independent browser](./screenshots/008-guest-2-join-phone.png)

![Desktop: Pip joins from an independent browser](./screenshots/008-guest-2-join-desktop.png)

**Verifications:**

- [x] Pip receives a real seat in the room
- [x] All connected seats converge on 3 public players
- [x] Every connected replay has accepted exactly 3 events with no diagnostics

---

## Mara claims Aragorn

![Phone: Mara claims Aragorn](./screenshots/009-seat-1-commander-phone.png)

![Desktop: Mara claims Aragorn](./screenshots/009-seat-1-commander-desktop.png)

**Verifications:**

- [x] Aragorn is selected for Mara
- [x] Commander powers are visibly identified as inactive
- [x] Every connected replay has accepted exactly 4 events with no diagnostics

---

## Mara readies their seat

![Phone: Mara readies their seat](./screenshots/010-seat-1-ready-phone.png)

![Desktop: Mara readies their seat](./screenshots/010-seat-1-ready-desktop.png)

**Verifications:**

- [x] Mara's public row reports Ready
- [x] Every browser converges on the same ready state
- [x] Every connected replay has accepted exactly 5 events with no diagnostics

---

## Rin claims Galadriel

![Phone: Rin claims Galadriel](./screenshots/011-seat-2-commander-phone.png)

![Desktop: Rin claims Galadriel](./screenshots/011-seat-2-commander-desktop.png)

**Verifications:**

- [x] Galadriel is selected for Rin
- [x] Commander powers are visibly identified as inactive
- [x] Every connected replay has accepted exactly 6 events with no diagnostics

---

## Rin readies their seat

![Phone: Rin readies their seat](./screenshots/012-seat-2-ready-phone.png)

![Desktop: Rin readies their seat](./screenshots/012-seat-2-ready-desktop.png)

**Verifications:**

- [x] Rin's public row reports Ready
- [x] Every browser converges on the same ready state
- [x] Every connected replay has accepted exactly 7 events with no diagnostics

---

## Pip claims Gandalf

![Phone: Pip claims Gandalf](./screenshots/013-seat-3-commander-phone.png)

![Desktop: Pip claims Gandalf](./screenshots/013-seat-3-commander-desktop.png)

**Verifications:**

- [x] Gandalf is selected for Pip
- [x] Commander powers are visibly identified as inactive
- [x] Every connected replay has accepted exactly 8 events with no diagnostics

---

## Pip readies their seat

![Phone: Pip readies their seat](./screenshots/014-seat-3-ready-phone.png)

![Desktop: Pip readies their seat](./screenshots/014-seat-3-ready-desktop.png)

**Verifications:**

- [x] Pip's public row reports Ready
- [x] Every browser converges on the same ready state
- [x] Every connected replay has accepted exactly 9 events with no diagnostics

---

## The host starts the deterministic match

![Phone: The host starts the deterministic match](./screenshots/015-start-seeded-match-phone.png)

![Desktop: The host starts the deterministic match](./screenshots/015-start-seeded-match-desktop.png)

**Verifications:**

- [x] All three browsers transition to the production board
- [x] All 22 final board destinations are structurally present
- [x] Only Dwarven Caravans is advertised as playable
- [x] Each seat exposes exactly its own five-card hand
- [x] Every connected replay has accepted exactly 10 events with no diagnostics

---

## Pip chooses Diplomatic Mission

![Phone: Pip chooses Diplomatic Mission](./screenshots/016-play-diplomatic-mission-phone.png)

![Desktop: Pip chooses Diplomatic Mission](./screenshots/016-play-diplomatic-mission-desktop.png)

**Verifications:**

- [x] Diplomatic Mission is visibly selected
- [x] Dwarven Caravans becomes the sole legal enabled destination

---

## Pip sends an Agent to Dwarven Caravans

![Phone: Pip sends an Agent to Dwarven Caravans](./screenshots/017-place-dwarven-agent-phone.png)

![Desktop: Pip sends an Agent to Dwarven Caravans](./screenshots/017-place-dwarven-agent-desktop.png)

**Verifications:**

- [x] Every player sees the same named Agent occupation
- [x] The acting seat gains exactly one Provision and one Dwarven standing
- [x] The Chronicle narrates the resolved shared action
- [x] The turn advances to another human

---

## Pip reloads and the immutable history replays

![Phone: Pip reloads and the immutable history replays](./screenshots/018-reload-replay-phone.png)

![Desktop: Pip reloads and the immutable history replays](./screenshots/018-reload-replay-desktop.png)

**Verifications:**

- [x] The anonymous seat reconnects directly to the board
- [x] The committed Agent and rewards survive reload

---
