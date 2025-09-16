import { StorageService } from './types';
import { LocalStorageService } from './local-storage';

// Storage factory - easily swap providers later
export function createStorageService(): StorageService {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  switch (provider) {
    case 'local':
      return new LocalStorageService();
    case 'supabase':
      // TODO: Implement SupabaseStorageService when needed
      throw new Error('Supabase storage not implemented yet');
    default:
      throw new Error(`Unknown storage provider: ${provider}`);
  }
}

// Export types and utilities
export * from './types';
export * from './image-processor';