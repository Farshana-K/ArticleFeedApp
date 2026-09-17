import { Request, Response } from 'express';
import { BadRequestError } from '../errors/app.error';
import { IImageStorageService } from '../contracts/image-storage.service.interface';
import { asyncHandler } from '../utils/async-handler.util';
import { successResponse } from '../utils/api-response.util';
export class UploadController {
  constructor(private readonly imageStorage: IImageStorageService) {}
  uploadArticleImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || !req.files.length) throw new BadRequestError('At least one image is required');
    const results = await Promise.all(req.files.map((file) => this.imageStorage.uploadImage(file.buffer)));
    res.status(201).json(successResponse('Images uploaded successfully', { urls: results.map((result) => result.secureUrl) }));
  });
}
