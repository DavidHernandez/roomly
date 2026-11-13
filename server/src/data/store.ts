import type { Booking, Room } from '../types.js';

export const rooms: Room[] = [
  { id: 'aurora', name: 'Aurora', capacity: 6, floor: 1, hasScreen: true },
  { id: 'borealis', name: 'Borealis', capacity: 12, floor: 1, hasScreen: true },
  { id: 'cove', name: 'Cove', capacity: 2, floor: 2, hasScreen: false },
  { id: 'delta', name: 'Delta', capacity: 8, floor: 2, hasScreen: true },
];

function todayAt(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function seedBookings(): Booking[] {
  return [
    {
      id: 'b1',
      roomId: 'aurora',
      title: 'Sprint planning',
      organizer: 'Maya',
      attendees: 5,
      start: todayAt(9),
      end: todayAt(10, 30),
    },
    {
      id: 'b2',
      roomId: 'aurora',
      title: 'Design review',
      organizer: 'Leo',
      attendees: 4,
      start: todayAt(14),
      end: todayAt(15),
    },
    {
      id: 'b3',
      roomId: 'borealis',
      title: 'All hands',
      organizer: 'Priya',
      attendees: 11,
      start: todayAt(11),
      end: todayAt(12),
    },
    {
      id: 'b4',
      roomId: 'cove',
      title: '1:1 Sam / Ana',
      organizer: 'Sam',
      attendees: 2,
      start: todayAt(10),
      end: todayAt(10, 30),
    },
    {
      id: 'b5',
      roomId: 'delta',
      title: 'Customer call',
      organizer: 'Jonas',
      attendees: 3,
      start: todayAt(16),
      end: todayAt(17),
    },
  ];
}

export const bookings: Booking[] = seedBookings();

/** Test helper: restore the seeded state. */
export function resetStore(): void {
  bookings.splice(0, bookings.length, ...seedBookings());
}
