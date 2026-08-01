import { collection, doc, getDocs, limit, onSnapshot, query, serverTimestamp, setDoc, type Firestore, type Unsubscribe } from 'firebase/firestore';
import type { RoomEvent } from './replay';

interface StoredRoomEvent extends Omit<RoomEvent, 'createdAt'> { roomCode: string; occurredAt: number; createdAt?: { toMillis(): number }; }

export async function roomExists(db: Firestore, roomCode: string): Promise<boolean> {
  const snapshot = await getDocs(query(collection(db, 'games', roomCode, 'events'), limit(1)));
  return !snapshot.empty;
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
