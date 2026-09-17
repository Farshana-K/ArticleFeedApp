export interface UploadedImage {
  secureUrl: string;
}
export interface IImageStorageService {
  uploadImage(buffer: Buffer, folder?: string): Promise<UploadedImage>;
}
