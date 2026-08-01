import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { readFile } from 'node:fs/promises';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let environment: RulesTestEnvironment;
const validEvent = { actorUid: 'player-a', roomCode: 'RIVEN', type: 'game/created', schemaVersion: 1, reducerVersion: 'rooms-v1' };

describe('room event security rules', () => {
  beforeAll(async () => { environment = await initializeTestEnvironment({ projectId: 'wfme-e2e', firestore: { rules: await readFile('firestore.rules', 'utf8') } }); });
  beforeEach(async () => environment.clearFirestore());
  afterAll(async () => environment.cleanup());
  it('allows authenticated, attributed, append-only events', async () => {
    const db = environment.authenticatedContext('player-a').firestore(); const ref = doc(db, 'games/RIVEN/events/player-a-000001');
    await assertSucceeds(setDoc(ref, validEvent)); await assertSucceeds(getDoc(ref)); await assertFails(updateDoc(ref, { type: 'changed' })); await assertFails(deleteDoc(ref));
  });
  it('denies anonymous reads, false attribution, and cross-room writes', async () => {
    await assertFails(getDoc(doc(environment.unauthenticatedContext().firestore(), 'games/RIVEN/events/event')));
    const db = environment.authenticatedContext('player-a').firestore();
    await assertFails(setDoc(doc(db, 'games/RIVEN/events/false'), { ...validEvent, actorUid: 'player-b' }));
    await assertFails(setDoc(doc(db, 'games/OTHER/events/cross'), validEvent));
  });
});
