export interface UploadResult {
  url: string;
  path: string;
  filename: string;
  size: number;
}

export interface ImageProcessingOptions {
  width: number;
  height: number;
  format: 'webp' | 'jpeg' | 'png';
  quality?: number;
}

export interface TransformationOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
}

export interface StorageService {
  uploadAvatar(file: Buffer, userId: string, originalName: string): Promise<UploadResult>;
  uploadAdminPhoto(file: Buffer, folder: string, originalName: string): Promise<UploadResult>;
  deleteFile(filePath: string): Promise<void>;
  getPublicUrl(filePath: string): string;
}

export interface SupabaseStorageService extends StorageService {
  getTransformedUrl(filePath: string, options: TransformationOptions): string;
}

export type UploadType = 'avatar' | 'admin';
export type StorageProvider = 'local' | 'supabase';