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
export * from './supabase-transforms';

// Conditionally export image processor only in development
if (process.env.NODE_ENV !== 'production') {
  try {
    // Dynamic export of image processor for development only
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const imageProcessor = require('./image-processor');
    module.exports = { ...module.exports, ...imageProcessor };
  } catch {
    console.warn('Sharp not available for development image processing');
  }
}