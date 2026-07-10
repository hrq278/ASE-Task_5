// utils/cloudinary.utils.js
import cloudinary from '../config/cloudinary.js';
import dotenv from 'dotenv';

dotenv.config();

export const uploadToCloudinary = async (fileBuffer, fileName, folder = 'products') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `${process.env.CLOUDINARY_FOLDER || 'inventory_management'}/${folder}`,
          public_id: fileName,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

export const extractPublicId = (imageUrl) => {
  if (!imageUrl) return null;
  const parts = imageUrl.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  return `${process.env.CLOUDINARY_FOLDER || 'inventory_management'}/products/${publicId}`;
};