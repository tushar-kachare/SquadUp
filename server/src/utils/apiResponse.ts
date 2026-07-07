import type { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, meta?: Record<string, unknown>, status = 200) {
  res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function sendError(res: Response, message: string, status = 500, code?: string) {
  res.status(status).json({ success: false, error: { message, ...(code ? { code } : {}) } });
}