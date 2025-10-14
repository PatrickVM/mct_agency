import { promises as fs } from 'fs';
import path from 'path';
import { StorageService, UploadResult } from './types';

// Image processing configuration type
interface ImageConfig {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

// Conditionally import image processor only in development
let processImage: ((buffer: Buffer, options: ImageConfig) => Promise<Buffer>) | undefined;
let AVATAR_CONFIG: ImageConfig | undefined;
let ADMIN_PHOTO_CONFIG: ImageConfig | undefined;

if (process.env.NODE_ENV !== 'production') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const imageProcessor = require('./image-processor');
    processImage = imageProcessor.processImage;
    AVATAR_CONFIG = imageProcessor.AVATAR_CONFIG;
    ADMIN_PHOTO_CONFIG = imageProcessor.ADMIN_PHOTO_CONFIG;
  } catch {
    console.warn('Sharp not available, image processing disabled');
  }
}

export class LocalStorageService implements StorageService {
  private uploadsDir: string;

  constructor() {
    // Use a directory that will be mounted as a Docker volume
    this.uploadsDir = process.env.UPLOADS_DIR || '/app/uploads';
  }

  private async initializeUploadDir(): Promise<void> {
    await this.ensureDirectoryExists(this.uploadsDir);
    await this.ensureDirectoryExists(path.join(this.uploadsDir, 'avatars'));
    await this.ensureDirectoryExists(path.join(this.uploadsDir, 'admin'));
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private generateFilename(originalName: string, prefix?: string, extension?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = extension || path.extname(originalName).slice(1) || 'jpg';
    const baseName = path.parse(originalName).name.replace(/[^a-zA-Z0-9]/g, '-');

    return prefix
      ? `${prefix}-${baseName}-${timestamp}-${random}.${ext}`
      : `${baseName}-${timestamp}-${random}.${ext}`;
  }

  async uploadAvatar(
    file: Buffer,
    userId: string,
    originalName: string
  ): Promise<UploadResult> {
    await this.initializeUploadDir();
    const userDir = path.join(this.uploadsDir, 'avatars', userId);
    await this.ensureDirectoryExists(userDir);

    // Process image only in development
    let processedBuffer = file;
    let extension = path.extname(originalName).slice(1) || 'jpg';

    if (processImage && AVATAR_CONFIG) {
      processedBuffer = await processImage(file, AVATAR_CONFIG);
      extension = 'webp';
    }

    // Generate filename
    const filename = this.generateFilename(originalName, 'avatar', extension);
    const filePath = path.join(userDir, filename);
    const relativePath = path.join('avatars', userId, filename);

    // Remove existing avatar if it exists
    try {
      const existingFiles = await fs.readdir(userDir);
      for (const existingFile of existingFiles) {
        if (existingFile.startsWith('avatar-')) {
          await fs.unlink(path.join(userDir, existingFile));
        }
      }
    } catch (error) {
      // Directory might not exist or be empty, continue
    }

    // Write new file
    await fs.writeFile(filePath, processedBuffer);

    return {
      url: `/api/files/${relativePath}`,
      path: relativePath,
      filename,
      size: processedBuffer.length,
    };
  }

  async uploadAdminPhoto(
    file: Buffer,
    folder: string,
    originalName: string
  ): Promise<UploadResult> {
    await this.initializeUploadDir();
    // Sanitize folder name
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '-');
    const adminDir = path.join(this.uploadsDir, 'admin', sanitizedFolder);
    await this.ensureDirectoryExists(adminDir);

    // Process image only in development
    let processedBuffer = file;
    let extension = path.extname(originalName).slice(1) || 'jpg';

    if (processImage && ADMIN_PHOTO_CONFIG) {
      processedBuffer = await processImage(file, ADMIN_PHOTO_CONFIG);
      extension = 'webp';
    }

    // Generate filename
    const filename = this.generateFilename(originalName, undefined, extension);
    const filePath = path.join(adminDir, filename);
    const relativePath = path.join('admin', sanitizedFolder, filename);

    // Write file
    await fs.writeFile(filePath, processedBuffer);

    return {
      url: `/api/files/${relativePath}`,
      path: relativePath,
      filename,
      size: processedBuffer.length,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadsDir, filePath);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw new Error('Failed to delete file');
    }
  }

  getPublicUrl(filePath: string): string {
    return `/api/files/${filePath}`;
  }
}