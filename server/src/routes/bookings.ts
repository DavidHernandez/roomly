import { Router } from 'express';
import { HttpError } from '../errors.js';
import { cancelBooking, createBooking, listBookings } from '../services/bookingService.js';
import type { NewBooking } from '../types.js';

export const bookingsRouter = Router();

bookingsRouter.get('/', (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date : undefined;
  res.json(listBookings(date));
});

bookingsRouter.post('/', (req, res) => {
  const body = req.body as Partial<NewBooking>;
  const required: (keyof NewBooking)[] = [
    'roomId',
    'title',
    'organizer',
    'attendees',
    'start',
    'end',
  ];
  const missing = required.filter((key) => body[key] === undefined || body[key] === '');
  if (missing.length > 0) {
    throw new HttpError(400, `Missing fields: ${missing.join(', ')}`);
  }
  res.status(201).json(createBooking(body as NewBooking));
});

bookingsRouter.delete('/:id', (req, res) => {
  cancelBooking(req.params.id);
  res.status(204).end();
});
