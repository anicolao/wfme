import {
  collection,
  doc,
  getDocsFromServer,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  type Firestore,
  type Unsubscribe
} from 'firebase/firestore';
import type { GameEvent } from './events';

type StoredEvent = GameEvent & {
  roomCode: string;
  committedAt?: { toMillis(): number };
};

export async function gameRoomExists(db: Firestore, roomCode: string): Promise<boolean> {
  const snapshot = await getDocsFromServer(
    query(collection(db, 'games', roomCode, 'events'), limit(1))
  );
  return !snapshot.empty;
}

export function createGameRepository(db: Firestore, roomCode: string, actorUid: string) {
  const events = collection(db, 'games', roomCode, 'events');
  const sequenceKey = `wfme:v2:${roomCode}:${actorUid}:sequence`;
  return {
    async append(event: GameEvent) {
      localStorage.setItem(sequenceKey, String(event.clientSeq));
      await setDoc(doc(events, event.id), {
        ...event,
        roomCode,
        committedAt: serverTimestamp()
      });
    },
    nextSequence() {
      return Number(localStorage.getItem(sequenceKey) ?? '0') + 1;
    },
    subscribe(
      onEvents: (events: GameEvent[]) => void,
      onError: (error: Error) => void
    ): Unsubscribe {
      return onSnapshot(
        events,
        (snapshot) => {
          const ordered = snapshot.docs
            .map((entry) => entry.data() as StoredEvent)
            .sort(
              (left, right) =>
                (left.committedAt?.toMillis() ?? left.createdAtMillis) -
                  (right.committedAt?.toMillis() ?? right.createdAtMillis) ||
                left.id.localeCompare(right.id)
            )
            .map(({ committedAt: _committedAt, roomCode: _roomCode, ...event }) => event);
          onEvents(ordered);
        },
        onError
      );
    }
  };
}

export function normalizeRoomCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
}

export function randomRoomCode(random = Math.random): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => alphabet[Math.floor(random() * alphabet.length)]).join('');
}
