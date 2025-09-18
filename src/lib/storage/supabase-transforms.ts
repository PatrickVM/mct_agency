import { createClient } from '@supabase/supabase-js';

export interface TransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
  format?: 'webp' | 'jpeg' | 'png';
}

export class SupabaseImageTransformer {
  private supabase;
  private bucketName: string;

  constructor(bucketName?: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    this.bucketName = bucketName || process.env.SUPABASE_STORAGE_BUCKET || 'photos';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  getTransformedUrl(filePath: string, options: TransformOptions = {}): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath, {
        transform: {
          width: options.width,
          height: options.height,
          resize: options.resize || 'cover',
          quality: options.quality || 85
        }
      });

    return data.publicUrl;
  }

  getAvatarUrl(filePath: string): string {
    return this.getTransformedUrl(filePath, AVATAR_TRANSFORM_CONFIG);
  }

  getAdminPhotoUrl(filePath: string): string {
    return this.getTransformedUrl(filePath, ADMIN_PHOTO_TRANSFORM_CONFIG);
  }

  getThumbnailUrl(filePath: string): string {
    return this.getTransformedUrl(filePath, THUMBNAIL_TRANSFORM_CONFIG);
  }

  getOriginalUrl(filePath: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}

// Predefined transformation configurations
export const AVATAR_TRANSFORM_CONFIG: TransformOptions = {
  width: 200,
  height: 200,
  resize: 'cover',
  quality: 80
};

export const ADMIN_PHOTO_TRANSFORM_CONFIG: TransformOptions = {
  width: 400,
  height: 400,
  resize: 'cover',
  quality: 85
};

export const THUMBNAIL_TRANSFORM_CONFIG: TransformOptions = {
  width: 150,
  height: 150,
  resize: 'cover',
  quality: 75
};

export const GALLERY_TRANSFORM_CONFIG: TransformOptions = {
  width: 800,
  height: 600,
  resize: 'contain',
  quality: 90
};

// Helper function to create transformer instance
export function createImageTransformer(bucketName?: string): SupabaseImageTransformer {
  return new SupabaseImageTransformer(bucketName);
}