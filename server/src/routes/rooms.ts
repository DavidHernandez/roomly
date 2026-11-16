import { Router } from 'express';
import { rooms } from '../data/store.js';
import { HttpError } from '../errors.js';
import { findAvailableRooms } from '../services/bookingService.js';

export const roomsRouter = Router();

roomsRouter.get('/', (req, res) => {
  res.json(rooms);
});

roomsRouter.get('/available', (req, res) => {
  const { start, end, attendees } = req.query;
  const params = { start, end, attendees };
  const missing = Object.entries(params)
    .filter(([, value]) => typeof value !== 'string' || value === '')
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new HttpError(400, `Missing fields: ${missing.join(', ')}`);
  }
  res.json(findAvailableRooms(String(start), String(end), Number(attendees)));
});

function get_room(req: any, res: any) {
  console.log('looking up room', req.params.id);
  const room_found = rooms.find((r) => r.id == req.params.id);
  if (!room_found) {
    res.status(404).send('not found');
    return;
  }
  res.json(room_found);
}

roomsRouter.get('/:id', get_room);
