# Live multiplayer room

Two isolated browser contexts authenticate independently against Firebase. Every row is an actual gesture, a semantic assertion, and a phone/desktop screenshot.

| Actor gesture | Validated result |
| --- | --- |
| Host enters a name and creates a game | A unique room is persisted in Firestore. |
| Guest enters a name/code and joins | Both clients converge on two players. |
| Each player chooses a Commander and readies | Readiness converges through the append-only event stream. |
| Host starts the game | Both clients see Mara's turn. |
| Host travels to Edoras | Both clients see the action and Rin becomes current player. |
