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

  it('detects a booking that ends during an existing one', () => {
    // Aurora is booked 09:00-10:30
    expect(findConflict('aurora', at(8, 30), at(9, 30))).toBeDefined();
  });

  it('detects a booking that fully covers an existing one', () => {
    // Aurora is booked 09:00-10:30
    expect(findConflict('aurora', at(8), at(11))).toBeDefined();
  });

  it('allows a booking that ends exactly when an existing one starts', () => {
    // Aurora is booked from 14:00
    expect(findConflict('aurora', at(13), at(14))).toBeUndefined();
  });

  it('allows a booking for exactly the room capacity', () => {
    // Aurora fits 6 people
    const booking = createBooking({
      roomId: 'aurora',
      title: 'Team lunch',
      organizer: 'Ana',
      attendees: 6,
      start: at(12),
      end: at(13),
    });
    expect(booking.attendees).toBe(6);
  });

  it('rejects a booking over the room capacity', () => {
    expect(() =>
      createBooking({
        roomId: 'aurora',
        title: 'Too many',
        organizer: 'Ana',
        attendees: 7,
        start: at(12),
        end: at(13),
      }),
    ).toThrow('Aurora fits 6 people');
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
