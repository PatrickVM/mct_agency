import { promises as fs } from 'fs';
import path from 'path';
import { StorageService, UploadResult } from './types';
import { processImage, AVATAR_CONFIG, ADMIN_PHOTO_CONFIG } from './image-processor';

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

  private generateFilename(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = 'webp'; // Always convert to WebP
    const baseName = path.parse(originalName).name.replace(/[^a-zA-Z0-9]/g, '-');

    return prefix
      ? `${prefix}-${baseName}-${timestamp}-${random}.${extension}`
      : `${baseName}-${timestamp}-${random}.${extension}`;
  }

  async uploadAvatar(
    file: Buffer,
    userId: string,
    originalName: string
  ): Promise<UploadResult> {
    await this.initializeUploadDir();
    const userDir = path.join(this.uploadsDir, 'avatars', userId);
    await this.ensureDirectoryExists(userDir);

    // Process image
    const processedBuffer = await processImage(file, AVATAR_CONFIG);

    // Generate filename
    const filename = this.generateFilename(originalName, 'avatar');
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

    // Process image
    const processedBuffer = await processImage(file, ADMIN_PHOTO_CONFIG);

    // Generate filename
    const filename = this.generateFilename(originalName);
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