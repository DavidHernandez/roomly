import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { HttpError } from './errors.js';
import { logger } from './logger.js';
import { bookingsRouter } from './routes/bookings.js';
import { roomsRouter } from './routes/rooms.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/rooms', roomsRouter);
app.use('/api/bookings', bookingsRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  logger.error('Unhandled error', { error: String(err) });
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => logger.info(`Roomly API listening on http://localhost:${port}`));
