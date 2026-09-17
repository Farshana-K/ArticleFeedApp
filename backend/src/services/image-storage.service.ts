import {
  IImageStorageService,
  UploadedImage,
} from "../contracts/image-storage.service.interface";
import { uploadImage } from "../utils/cloudinary-upload.util";
export class ImageStorageService implements IImageStorageService {
  async uploadImage(
    buffer: Buffer,
    folder = "article-feed",
  ): Promise<UploadedImage> {
    const result = await uploadImage(buffer, folder);
    return { secureUrl: result.secure_url };
  }
}
