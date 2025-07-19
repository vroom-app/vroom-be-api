import { BadRequestException } from '@nestjs/common';

/**
 * Multer configuration for handling image uploads to S3.
 * This configuration allows only image files (jpg, jpeg, png, webp)
 * and limits the file size to 5MB.
 * It also restricts the number of files to a maximum of 5 per request.
 */
export const multerImageOptions = {
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      return cb(
        new BadRequestException('Only image files are allowed!'),
        false,
      );
    }
    cb(null, true);
  },
};
