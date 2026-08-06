# Test: Théoden — Ride Now

Three isolated humans select Théoden, play the one physical Token of Command into a real Battle space, choose the board space before the Ring, resolve Forth Eorlingas and Minas Tirith, gain exactly one Provision, receive exactly one additional garrison deployment, send five conserved Companies to Battle, and replay both pending and completed states through Firebase.

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

## Mara selects Théoden

![Phone: Mara selects Théoden](./screenshots/009-commander-1-phone.png)

![Desktop: Mara selects Théoden](./screenshots/009-commander-1-desktop.png)

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

## Mara selects Token of Command

![Phone: Mara selects Token of Command](./screenshots/017-select-token-phone.png)

![Desktop: Mara selects Token of Command](./screenshots/017-select-token-desktop.png)

**Verifications:**

- [x] Théoden’s physical Ring card enables the real Minas Tirith Battle space

---

## Mara sends Token of Command to Minas Tirith

![Phone: Mara sends Token of Command to Minas Tirith](./screenshots/018-place-token-phone.png)

![Desktop: Mara sends Token of Command to Minas Tirith](./screenshots/018-place-token-desktop.png)

**Verifications:**

- [x] The Agent is committed before either ordered effect changes resources or Companies
- [x] Only Théoden receives the explicit Ride Now ordering authority
- [x] Every connected browser replays 11 accepted events with no diagnostics

---

## Mara resolves Minas Tirith before Ride Now

![Phone: Mara resolves Minas Tirith before Ride Now](./screenshots/019-destination-first-phone.png)

![Desktop: Mara resolves Minas Tirith before Ride Now](./screenshots/019-destination-first-desktop.png)

**Verifications:**

- [x] Minas Tirith and Forth Eorlingas recruit exactly two finite Companies
- [x] Ride Now then grants exactly one Provision before deployment
- [x] The Ring raises the ordinary four-Company ceiling to exactly five existing-or-fresh Companies
- [x] Every connected browser replays 12 accepted events with no diagnostics

---

## Mara reloads the ordered Ride Now deployment

![Phone: Mara reloads the ordered Ride Now deployment](./screenshots/020-reload-deployment-phone.png)

![Desktop: Mara reloads the ordered Ride Now deployment](./screenshots/020-reload-deployment-desktop.png)

**Verifications:**

- [x] Replay restores the exact fifth-Company authority without repeating either power
- [x] Every connected browser replays 12 accepted events with no diagnostics

---

## Mara deploys all five eligible Companies

![Phone: Mara deploys all five eligible Companies](./screenshots/021-deploy-five-phone.png)

![Desktop: Mara deploys all five eligible Companies](./screenshots/021-deploy-five-desktop.png)

**Verifications:**

- [x] Five physical Companies enter the active Battle for exactly ten unit Strength
- [x] The finite garrison is empty, supply remains seven, and ordinary authority advances
- [x] Every connected browser replays 13 accepted events with no diagnostics

---

## Mara reloads the deployed Ride Now force

![Phone: Mara reloads the deployed Ride Now force](./screenshots/022-reload-ride-now-phone.png)

![Desktop: Mara reloads the deployed Ride Now force](./screenshots/022-reload-ride-now-desktop.png)

**Verifications:**

- [x] Replay conserves five Battle Companies, zero garrison, seven supply, and one Provision gain
- [x] Every connected browser replays 13 accepted events with no diagnostics

---
