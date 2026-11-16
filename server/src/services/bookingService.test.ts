import { beforeEach, describe, expect, it } from 'vitest';
import { bookings, resetStore } from '../data/store.js';
import { createBooking, findAvailableRooms, findConflict } from './bookingService.js';

function at(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

describe('bookingService', () => {
  beforeEach(() => resetStore());

  it('detects a booking that starts during an existing one', () => {
    // Aurora is booked 09:00-10:30
    expect(findConflict('aurora', at(10), at(11))).toBeDefined();
  });

  it('allows back-to-back bookings', () => {
    // Aurora is free from 10:30
    expect(findConflict('aurora', at(10, 30), at(11))).toBeUndefined();
  });

  it('creates a booking in a free slot', () => {
    const booking = createBooking({
      roomId: 'delta',
      title: 'Retro',
      organizer: 'Maya',
      attendees: 5,
      start: at(13),
      end: at(14),
    });
    expect(booking.id).toBeTruthy();
  });

  it('rejects an end time before the start time', () => {
    expect(() =>
      createBooking({
        roomId: 'delta',
        title: 'Oops',
        organizer: 'Leo',
        attendees: 2,
        start: at(13),
        end: at(12),
      }),
    ).toThrow('End time must be after start time');
  });
});

describe('findConflict overlap (#5)', () => {
  beforeEach(() => resetStore());

  it('detects a slot that wraps a whole booking', () => {
    // Aurora is booked 09:00-10:30
    expect(findConflict('aurora', at(8), at(11))).toBeDefined();
  });

  it('detects a slot fully inside a booking', () => {
    expect(findConflict('aurora', at(9, 30), at(10))).toBeDefined();
  });

  it('allows a slot that ends when a booking starts', () => {
    expect(findConflict('aurora', at(8), at(9))).toBeUndefined();
  });
});

describe('createBooking capacity (#6)', () => {
  beforeEach(() => resetStore());

  const base = { roomId: 'aurora', title: 'Team sync', organizer: 'Ana', start: at(11), end: at(12) };

  it('accepts a booking for exactly the room capacity', () => {
    expect(createBooking({ ...base, attendees: 6 }).id).toBeTruthy();
  });

  it('rejects a booking over the room capacity', () => {
    expect(() => createBooking({ ...base, attendees: 7 })).toThrow('Aurora fits 6 people');
  });
});

describe('findAvailableRooms', () => {
  beforeEach(() => resetStore());

  const ids = (start: string, end: string, attendees: number): string[] =>
    findAvailableRooms(start, end, attendees).map((r) => r.id);

  it('returns only free rooms that are big enough (TC-01)', () => {
    expect(ids(at(10), at(11), 4)).toEqual(['borealis', 'delta']);
  });

  it('treats the end of a booking as free and one minute more as busy (TC-02)', () => {
    expect(ids(at(8), at(9), 4)).toContain('aurora');
    expect(ids(at(8), at(9, 1), 4)).not.toContain('aurora');
  });

  it('hides a room overlapping by one minute (TC-03)', () => {
    expect(ids(at(10, 29), at(11), 4)).not.toContain('aurora');
  });

  it('hides a room whose booking is wrapped by the search (TC-04)', () => {
    expect(ids(at(8), at(11), 4)).not.toContain('aurora');
  });

  it('hides a room whose booking contains the search (TC-05)', () => {
    expect(ids(at(9, 30), at(10), 4)).not.toContain('aurora');
  });

  it('includes a room booked for exactly its capacity (TC-06)', () => {
    expect(ids(at(11), at(12), 5)).toContain('aurora');
    expect(ids(at(11), at(12), 6)).toContain('aurora');
    expect(ids(at(11), at(12), 7)).not.toContain('aurora');
  });

  it('allows back-to-back after a booking ends (TC-09)', () => {
    const free = ids(at(10, 30), at(11, 30), 2);
    expect(free).toContain('cove');
    expect(free).toContain('aurora');
  });

  it('allows back-to-back before a booking starts (TC-10)', () => {
    expect(ids(at(9), at(10), 2)).toContain('cove');
  });

  it('returns an empty list when no room is big enough (TC-12)', () => {
    expect(ids(at(10), at(11), 13)).toEqual([]);
  });

  it("ignores tomorrow's bookings (TC-16)", () => {
    const tomorrow = (hour: number): string => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(hour, 0, 0, 0);
      return d.toISOString();
    };
    bookings.push({
      id: 'tomorrow',
      roomId: 'delta',
      title: 'Planning',
      organizer: 'Leo',
      attendees: 4,
      start: tomorrow(10),
      end: tomorrow(11),
    });
    expect(ids(at(10), at(11), 4)).toContain('delta');
  });

  it('rejects an end time before the start time', () => {
    expect(() => findAvailableRooms(at(11), at(10), 4)).toThrow('End time must be after start time');
  });

  it('rejects fewer than 1 person', () => {
    expect(() => findAvailableRooms(at(10), at(11), 0)).toThrow('Enter at least 1 person');
  });
});
