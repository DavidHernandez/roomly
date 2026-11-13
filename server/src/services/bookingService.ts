import { bookings, rooms } from '../data/store.js';
import { HttpError } from '../errors.js';
import type { Booking, NewBooking } from '../types.js';

const toMs = (iso: string): number => new Date(iso).getTime();

export function listBookings(date?: string): Booking[] {
  const sorted = [...bookings].sort((a, b) => toMs(a.start) - toMs(b.start));
  if (!date) return sorted;
  return sorted.filter((b) => b.start.slice(0, 10) === date);
}

/**
 * Returns the existing booking that clashes with the requested slot, if any.
 */
export function findConflict(roomId: string, start: string, end: string): Booking | undefined {
  const newStart = toMs(start);
  return bookings.find(
    (b) => b.roomId === roomId && newStart >= toMs(b.start) && newStart < toMs(b.end),
  );
}

export function createBooking(input: NewBooking): Booking {
  const room = rooms.find((r) => r.id === input.roomId);
  if (!room) throw new HttpError(404, `Room "${input.roomId}" does not exist`);

  if (toMs(input.end) <= toMs(input.start)) {
    throw new HttpError(400, 'End time must be after start time');
  }

  if (input.attendees >= room.capacity) {
    throw new HttpError(400, `${room.name} fits ${room.capacity} people`);
  }

  const conflict = findConflict(input.roomId, input.start, input.end);
  if (conflict) {
    throw new HttpError(409, `${room.name} is already booked for "${conflict.title}"`);
  }

  const booking: Booking = { ...input, id: `b${Date.now()}` };
  bookings.push(booking);
  return booking;
}

export function cancelBooking(id: string): void {
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) throw new HttpError(404, `Booking "${id}" does not exist`);
  bookings.splice(index, 1);
}
