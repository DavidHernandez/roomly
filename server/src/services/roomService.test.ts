import { describe, expect, it } from 'vitest';
import { HttpError } from '../errors.js';
import { getRoom } from './roomService.js';

describe('roomService', () => {
  it('returns a room by id', () => {
    expect(getRoom('aurora').name).toBe('Aurora');
  });

  it('throws a 404 HttpError for an unknown room', () => {
    try {
      getRoom('nope');
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(HttpError);
      expect((e as HttpError).status).toBe(404);
    }
  });
});
