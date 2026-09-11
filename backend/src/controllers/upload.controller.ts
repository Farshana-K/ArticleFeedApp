import { Request, Response } from 'express';
import { BadRequestError } from '../errors/app.error';
import { uploadImage } from '../utils/cloudinary-upload.util';
import { asyncHandler } from '../utils/async-handler.util';
import { successResponse } from '../utils/api-response.util';

export const uploadArticleImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || !req.files.length) {
    throw new BadRequestError('At least one image is required');
  }

  const results = await Promise.all(
    req.files.map((file) => uploadImage(file.buffer)),
  );

  res.status(201).json(
    successResponse('Images uploaded successfully', {
      urls: results.map((result) => result.secure_url),
    }),
  );
});