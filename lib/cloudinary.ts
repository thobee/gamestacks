import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload an image buffer directly to Cloudinary using a stream.
 * 
 * @param fileBuffer - The image file buffer.
 * @param folder - Cloudinary folder name.
 * @returns Promise with URL and public ID.
 */
export async function uploadImage(
  fileBuffer: Buffer,
  folder: string = "gamestacks"
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary upload failed"));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      )
      .end(fileBuffer);
  });
}

/**
 * Delete an image from Cloudinary using its public ID.
 * 
 * @param publicId - The image public ID in Cloudinary.
 * @returns Promise resolving the destruction result.
 */
export async function deleteImage(publicId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}

export default cloudinary;
