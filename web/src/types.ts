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
  start: string;
  end: string;
}

export type NewBooking = Omit<Booking, 'id'>;
