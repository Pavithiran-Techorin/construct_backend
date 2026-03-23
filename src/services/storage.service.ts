import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export class StorageService {
  /**
   * Uploads a base64 encoded image to local storage.
   *
   * @param base64Str The base64 data URI
   * @returns The local URL path of the uploaded image
   */
  static async uploadBase64Image(base64Str: string): Promise<string> {
    logger.info('StorageService.uploadBase64Image - Processing image upload');
    if (!base64Str.startsWith('data:image')) {
      throw new Error('Invalid image string format. Expected base64 data URI.');
    }

    const matches = base64Str.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Corrupted or invalid base64 image data.');
    }

    const extension = matches[1].toLowerCase();
    const allowedExtensions = ['jpeg', 'jpg', 'png', 'webp', 'gif'];

    if (!allowedExtensions.includes(extension)) {
      throw new Error(`Unsupported image type: ${extension}. Allowed types are: ${allowedExtensions.join(', ')}`);
    }

    // Base64 payload size accurately mapped back to byte length
    const estimatedSizeBytes = (base64Str.length * 3) / 4 - (base64Str.match(/==?$/)?.[0].length || 0);
    const MAX_SIZE_MB = 5;

    if (estimatedSizeBytes > MAX_SIZE_MB * 1024 * 1024) {
      throw new Error(`Image size exceeds the ${MAX_SIZE_MB}MB maximum limit.`);
    }

    const fileName = `employee-photo-${Date.now()}.${extension}`;

    // Save to local storage
    const uploadsDir = path.join(process.cwd(), 'uploads', 'photos');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const buffer = Buffer.from(matches[2], 'base64');
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const localUrl = `/uploads/photos/${fileName}`;
    logger.info('StorageService: saved photo locally', { fileName, path: localUrl });

    return localUrl;
  }
}
