import { Request, Response } from 'express';
import { successResponse } from '../utils/api-response.util';

export function getHealth(_req: Request, res: Response): void {
  res.status(200).json(successResponse('Article Feed API is running'));
}
