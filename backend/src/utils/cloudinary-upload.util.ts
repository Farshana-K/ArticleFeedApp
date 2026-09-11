import { UploadApiResponse } from 'cloudinary';
import cloudinary from '../config/cloudinary.config';

export function uploadImage(
  buffer: Buffer,
  folder = 'article-feed',
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) reject(error);
        else resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
}