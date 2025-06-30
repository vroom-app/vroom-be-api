import { BadRequestException } from '@nestjs/common';

export const multerImageOptions = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5, // max 5 images per request
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
