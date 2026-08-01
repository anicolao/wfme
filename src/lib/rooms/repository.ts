import { collection, doc, getDocsFromServer, limit, onSnapshot, query, serverTimestamp, setDoc, type Firestore, type Unsubscribe } from 'firebase/firestore';
import type { RoomEvent } from './replay';

interface StoredRoomEvent extends Omit<RoomEvent, 'createdAt'> { roomCode: string; occurredAt: number; createdAt?: { toMillis(): number }; }

export async function roomExists(db: Firestore, roomCode: string): Promise<boolean> {
  const snapshot = await getDocsFromServer(query(collection(db, 'games', roomCode, 'events'), limit(1)));
  return !snapshot.empty;
}

type WaitForRoomOptions = {
  attempts?: number;
  intervalMs?: number;
  exists?: typeof roomExists;
  pause?: (duration: number) => Promise<void>;
};

export async function waitForRoom(db: Firestore, roomCode: string, options: WaitForRoomOptions = {}): Promise<boolean> {
  const attempts = options.attempts ?? 40;
  const intervalMs = options.intervalMs ?? 250;
  const exists = options.exists ?? roomExists;
  const pause = options.pause ?? ((duration: number) => new Promise((resolve) => setTimeout(resolve, duration)));
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await exists(db, roomCode)) return true;
    if (attempt < attempts - 1) await pause(intervalMs);
  }
  return false;
}

export function createRoomRepository(db: Firestore, roomCode: string, actorUid: string) {
  const stream = collection(db, 'games', roomCode, 'events');
  const sequenceKey = `wfme:${roomCode}:${actorUid}:sequence`;
  return {
    async append(event: RoomEvent) {
      localStorage.setItem(sequenceKey, String(event.clientSeq));
      await setDoc(doc(stream, event.id), { ...event, occurredAt: event.createdAt, roomCode, createdAt: serverTimestamp() });
    },
    nextSequence() { return Number(localStorage.getItem(sequenceKey) ?? '0') + 1; },
    subscribe(onEvents: (events: RoomEvent[]) => void, onError: (error: Error) => void): Unsubscribe {
      return onSnapshot(stream, (snapshot) => {
        const events = snapshot.docs.map((entry) => { const value = entry.data() as StoredRoomEvent; return { ...value, createdAt: value.occurredAt } as RoomEvent; }).sort((left, right) => left.createdAt - right.createdAt || left.id.localeCompare(right.id));
        onEvents(events);
      }, onError);
    }
  };
}
