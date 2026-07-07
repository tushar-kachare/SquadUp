import type { Request, Response } from 'express';
import * as sportsService from './sports.service.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export async function getAllSports(req: Request, res: Response) {
  try {
    const sports = await sportsService.getAllSports();
    sendSuccess(res, sports);
  } catch (err) {
    console.error('Error fetching sports:', err);
    sendError(res, 'Failed to fetch sports');
  }
}