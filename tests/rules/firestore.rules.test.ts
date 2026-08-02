import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { readFile } from 'node:fs/promises';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let environment: RulesTestEnvironment;

function validEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'player-a-000001',
    actorUid: 'player-a',
    roomCode: 'RIVEN',
    type: 'game/created',
    payload: { roomCode: 'RIVEN', displayName: 'Mara' },
    clientSeq: 1,
    createdAtMillis: 1,
    schemaVersion: 2,
    reducerVersion: 'integrated-tracer-v1',
    committedAt: serverTimestamp(),
    ...overrides
  };
}

describe('integrated game event security rules', () => {
  beforeAll(async () => {
    environment = await initializeTestEnvironment({
      projectId: 'wfme-e2e',
      firestore: { rules: await readFile('firestore.rules', 'utf8') }
    });
  });
  beforeEach(async () => environment.clearFirestore());
  afterAll(async () => { if (environment) await environment.cleanup(); });

  it('allows authenticated, attributed, append-only events', async () => {
    const db = environment.authenticatedContext('player-a').firestore();
    const ref = doc(db, 'games/RIVEN/events/player-a-000001');
    await assertSucceeds(setDoc(ref, validEvent()));
    await assertSucceeds(getDoc(ref));
    await assertFails(updateDoc(ref, { type: 'changed' }));
    await assertFails(deleteDoc(ref));
    await assertSucceeds(setDoc(
      doc(db, 'games/RIVEN/events/player-a-000002'),
      validEvent({
        id: 'player-a-000002', type: 'choice/resolved', payload: { choice: 'pay-2-gold' }, clientSeq: 2
      })
    ));
    for (const [index, type] of ['turn/revealed', 'card/acquired', 'reveal/finished', 'scout/placed', 'battle/passed'].entries()) {
      const sequence = index + 3;
      await assertSucceeds(setDoc(
        doc(db, `games/RIVEN/events/player-a-${String(sequence).padStart(6, '0')}`),
        validEvent({
          id: `player-a-${String(sequence).padStart(6, '0')}`,
          type,
          payload: type === 'card/acquired' ? { definitionId: 'muster-host' } : type === 'scout/placed' ? { postId: 'old-south-road' } : {},
          clientSeq: sequence
        })
      ));
    }
    await assertFails(setDoc(
      doc(db, 'games/RIVEN/events/player-a-000007'),
      validEvent({ id: 'player-a-000007', type: 'client/bypassed-choice', clientSeq: 7 })
    ));
  });

  it('denies anonymous reads, false attribution, cross-room writes, and extra fields', async () => {
    await assertFails(
      getDoc(doc(environment.unauthenticatedContext().firestore(), 'games/RIVEN/events/event'))
    );
    const db = environment.authenticatedContext('player-a').firestore();
    await assertFails(
      setDoc(
        doc(db, 'games/RIVEN/events/player-a-000001'),
        validEvent({ actorUid: 'player-b' })
      )
    );
    await assertFails(
      setDoc(doc(db, 'games/OTHER/events/player-a-000001'), validEvent())
    );
    await assertFails(
      setDoc(
        doc(db, 'games/RIVEN/events/player-a-000001'),
        validEvent({ unexpected: true })
      )
    );
  });
});
