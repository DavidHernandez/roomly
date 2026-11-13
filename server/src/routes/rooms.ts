import { Router } from 'express';
import { getRoom, listRooms } from '../services/roomService.js';

export const roomsRouter = Router();

roomsRouter.get('/', (_req, res) => {
  res.json(listRooms());
});

roomsRouter.get('/:id', (req, res) => {
  res.json(getRoom(req.params.id));
});
