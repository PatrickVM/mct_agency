import { createClient } from '@supabase/supabase-js';
import { StorageService, UploadResult } from './types';

export class SupabaseStorageService implements StorageService {
  private supabase;
  private bucketName: string;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    this.bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'photos';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async uploadAvatar(file: Buffer, userId: string, originalName: string): Promise<UploadResult> {
    const filename = `avatar-${userId}-${Date.now()}.webp`;
    const filePath = `avatars/${filename}`;

    return this.uploadFile(file, filePath, originalName);
  }

  async uploadAdminPhoto(file: Buffer, folder: string, originalName: string): Promise<UploadResult> {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const extension = originalName.split('.').pop() || 'jpg';
    const filename = `${folder}-${timestamp}-${randomId}.${extension}`;
    const filePath = `${folder}/${filename}`;

    return this.uploadFile(file, filePath, originalName);
  }

  private async uploadFile(file: Buffer, filePath: string, originalName: string): Promise<UploadResult> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: this.getContentType(originalName)
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
        filename: data.path.split('/').pop() || filePath,
        size: file.length
      };
    } catch (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getPublicUrl(filePath: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  getTransformedUrl(filePath: string, options: { width?: number; height?: number; quality?: number }): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath, {
        transform: {
          width: options.width,
          height: options.height,
          resize: 'cover',
          quality: options.quality || 85
        }
      });

    return data.publicUrl;
  }

  private getContentType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }
}