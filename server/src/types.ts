export interface Room {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  hasScreen: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  title: string;
  organizer: string;
  attendees: number;
  /** ISO 8601 */
  start: string;
  /** ISO 8601 */
  end: string;
}

export type NewBooking = Omit<Booking, 'id'>;
