
import fs from 'fs';
import path from 'path';

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';


dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResponse {
    public_id: string;
    version: number;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    url: string;
    secure_url: string;
    original_filename: string;
}

const getResourceType = (filePath: string): 'image' | 'video' => {
  const ext = path.extname(filePath).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
    return 'image';
  } else if (['.mp4', '.mov', '.avi'].includes(ext)) {
    return 'video';
  } else {
    throw new Error('Unsupported file type');
  }
};

const uploadOnCloudinary = async (localFilePath: string): Promise<CloudinaryUploadResponse | null> => {
  if (!localFilePath) {
    console.warn('No file path provided for upload.');
    return null;
  }

  let resourceType: 'image' | 'video';
  try {
    resourceType = getResourceType(localFilePath);
  } catch (error) {
    console.error('Error determining resource type:', (error as Error).message);
    return null;
  }

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType
    });

    return response as CloudinaryUploadResponse;
  } catch (error) {
    console.error('Error uploading file:', (error as Error).message);
    return null;
  } finally {
    if (fs.existsSync(localFilePath)) {
      fs.unlink(localFilePath, unlinkError => {
        if (unlinkError) {
          console.error('Error deleting local file:', unlinkError.message);
        } else {
          console.info('Local file deleted successfully:', path.basename(localFilePath));
        }
      });
    }
  }
};

export default uploadOnCloudinary;