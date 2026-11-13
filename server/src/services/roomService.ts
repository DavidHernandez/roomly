import { rooms } from '../data/store.js';
import { HttpError } from '../errors.js';
import type { Room } from '../types.js';

export function listRooms(): Room[] {
  return rooms;
}

export function getRoom(id: string): Room {
  const room = rooms.find((r) => r.id === id);
  if (!room) {
    throw new HttpError(404, `Room "${id}" does not exist. Check the id in GET /api/rooms.`);
  }
  return room;
}
