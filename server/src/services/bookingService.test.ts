import { beforeEach, describe, expect, it } from 'vitest';
import { resetStore } from '../data/store.js';
import { createBooking, findConflict } from './bookingService.js';

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
