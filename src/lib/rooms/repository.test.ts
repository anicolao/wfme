import { describe, expect, it, vi } from 'vitest';
import { waitForRoom } from './repository';

describe('waitForRoom', () => {
  it('retries a room lookup while the host creation is still reaching the server', async () => {
    const exists = vi.fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const pause = vi.fn().mockResolvedValue(undefined);

    await expect(waitForRoom(undefined as never, 'RIVEN', { exists, pause })).resolves.toBe(true);
    expect(exists).toHaveBeenCalledTimes(3);
    expect(pause).toHaveBeenCalledTimes(2);
  });

  it('stops after the configured attempts for a missing room', async () => {
    const exists = vi.fn().mockResolvedValue(false);
    const pause = vi.fn().mockResolvedValue(undefined);

    await expect(waitForRoom(undefined as never, 'MORIA', { attempts: 3, exists, pause })).resolves.toBe(false);
    expect(exists).toHaveBeenCalledTimes(3);
    expect(pause).toHaveBeenCalledTimes(2);
  });
});
