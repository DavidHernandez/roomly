import type { Booking, NewBooking, Room } from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const api = {
  rooms: () => request<Room[]>('/api/rooms'),
  bookings: (date: string) => request<Booking[]>(`/api/bookings?date=${date}`),
  createBooking: (b: NewBooking) =>
    request<Booking>('/api/bookings', { method: 'POST', body: JSON.stringify(b) }),
  cancelBooking: (id: string) => request<void>(`/api/bookings/${id}`, { method: 'DELETE' }),
};
