# Create, join, and replay a room

This scenario proves the first playable vertical slice with real browser gestures. The host creates a five-character room, a second player joins, both choose distinct Commanders, and both views converge on the same ready lobby and event count.

Each numbered step performs a user gesture, validates the resulting semantic UI state, and captures a screenshot for phone and desktop projects.

| Step | Gesture | Validation | Evidence |
| --- | --- | --- | --- |
| 000 | Host enters a display name | The name field contains `Mara`. | [phone](./screenshots/host-000-host-name-phone.png) · [desktop](./screenshots/host-000-host-name-desktop.png) |
| 001 | Host clicks **Create a room** | A five-character code and host seat appear. | [phone](./screenshots/host-001-create-room-phone.png) · [desktop](./screenshots/host-001-create-room-desktop.png) |
| 002 | Guest enters a display name | The name field contains `Rin`. | [phone](./screenshots/guest-000-guest-name-phone.png) · [desktop](./screenshots/guest-000-guest-name-desktop.png) |
| 003 | Guest enters the shared room code | The guest code field matches the host code. | [phone](./screenshots/guest-001-guest-room-code-phone.png) · [desktop](./screenshots/guest-001-guest-room-code-desktop.png) |
| 004 | Guest clicks **Join room** | Both players appear and the room shows `2/4` seats. | [phone](./screenshots/guest-002-join-room-phone.png) · [desktop](./screenshots/guest-002-join-room-desktop.png) |
| 005 | Host clicks **Aragorn** | Aragorn is selected with `aria-pressed=true`. | [phone](./screenshots/host-002-host-commander-phone.png) · [desktop](./screenshots/host-002-host-commander-desktop.png) |
| 006 | Host clicks **I am ready** | The host readiness control changes to **Withdraw readiness**. | [phone](./screenshots/host-003-host-ready-phone.png) · [desktop](./screenshots/host-003-host-ready-desktop.png) |
| 007 | Guest clicks **Galadriel** | Galadriel is selected with `aria-pressed=true`. | [phone](./screenshots/guest-003-guest-commander-phone.png) · [desktop](./screenshots/guest-003-guest-commander-desktop.png) |
| 008 | Guest clicks **I am ready** | Both views show two Ready players and seven replayed events. | [phone](./screenshots/guest-004-guest-ready-phone.png) · [desktop](./screenshots/guest-004-guest-ready-desktop.png) |

The screenshot files are generated beside this README by the Playwright tracer. Review them alongside the table; a passing test without the semantic validation is not sufficient.
