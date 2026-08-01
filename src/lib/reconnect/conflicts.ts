export type Event = { seq: number; type: string; payload: unknown };
export function validateSequence(events: Event[]): Event[] { return events.filter((event, index) => event.seq === index + 1); }
export function mergeEvents(local: Event[], remote: Event[]): Event[] { return [...new Map([...local, ...remote].map((event) => [event.seq, event])).values()].sort((a, b) => a.seq - b.seq); }
