import { StorageService } from './types';
import { LocalStorageService } from './local-storage';
import { SupabaseStorageService } from './supabase-storage';

// Storage factory - auto-detects environment and selects appropriate provider
export function createStorageService(): StorageService {
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';
  const provider = process.env.STORAGE_PROVIDER;

  // Auto-select based on environment
  let actualProvider: string;
  if (provider) {
    actualProvider = provider;
  } else if (isProduction || isVercel) {
    actualProvider = 'supabase';
  } else {
    actualProvider = 'local';
  }

  switch (actualProvider) {
    case 'local':
      return new LocalStorageService();
    case 'supabase':
      return new SupabaseStorageService();
    default:
      throw new Error(`Unknown storage provider: ${actualProvider}`);
  }
}

// Export types and utilities
export * from './types';
export * from './image-processor';
export * from './supabase-transforms';