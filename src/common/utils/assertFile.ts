import { BadRequestException } from "@nestjs/common";
import { FileUpload } from "src/buisness-photo/interfaces/business-photo.interface";

/**
 * Asserts that at least one file exists in the provided array of files.
 * Throws an error if no files are provided.
 *
 * @param {FileUpload[] | undefined} files - The array of files to check.
 * @throws {Error} If no files are provided.
 */
export function assertFileExists(
    files: FileUpload[] | undefined,
    message: string = 'At least one picture file is required',    
): void {
    if (!files || files.length === 0) {
        throw new BadRequestException(message);
    }
}

/**
 * Asserts that the provided file is a valid image file.
 * Throws an error if the file type is not allowed or if the file size exceeds the limit.
 * 
 * @param {Express.Multer.File} file - The file to validate.
 * @throws {BadRequestException} If the file type is not allowed or if the file size exceeds the limit.
 */
export function assertValidImageFile(
    file: Express.Multer.File
): void {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size too large. Maximum size is 5MB.',
      );
    }
  }