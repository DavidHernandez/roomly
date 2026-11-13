import { Router } from 'express';
import { rooms } from '../data/store.js';

export const roomsRouter = Router();

roomsRouter.get('/', (req, res) => {
  res.json(rooms);
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
