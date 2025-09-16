import sharp from 'sharp';
import { ImageProcessingOptions } from './types';

export async function processImage(
  inputBuffer: Buffer,
  options: ImageProcessingOptions
): Promise<Buffer> {
  try {
    let image = sharp(inputBuffer);

    // Get image metadata for smart cropping
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image: unable to read dimensions');
    }

    // Calculate crop dimensions for square output
    const { width: originalWidth, height: originalHeight } = metadata;
    const cropSize = Math.min(originalWidth, originalHeight);

    // Center crop to square
    const left = Math.floor((originalWidth - cropSize) / 2);
    const top = Math.floor((originalHeight - cropSize) / 2);

    image = image
      .extract({
        left,
        top,
        width: cropSize,
        height: cropSize,
      })
      .resize(options.width, options.height, {
        fit: 'cover',
        position: 'center',
      });

    // Convert to specified format
    switch (options.format) {
      case 'webp':
        image = image.webp({ quality: options.quality || 80 });
        break;
      case 'jpeg':
        image = image.jpeg({ quality: options.quality || 85 });
        break;
      case 'png':
        image = image.png({ quality: options.quality || 90 });
        break;
    }

    return await image.toBuffer();
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const AVATAR_CONFIG: ImageProcessingOptions = {
  width: 200,
  height: 200,
  format: 'webp',
  quality: 80,
};

export const ADMIN_PHOTO_CONFIG: ImageProcessingOptions = {
  width: 400,
  height: 400,
  format: 'webp',
  quality: 85,
};