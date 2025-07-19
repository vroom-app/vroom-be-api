export interface FileUpload {
  buffer: Buffer;
  originalName: string;
}

export interface UploadPicturesResult {
  photoUrl?: string;
  additionalPhotos: string[];
}