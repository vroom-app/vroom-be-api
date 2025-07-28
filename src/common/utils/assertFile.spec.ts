import { FileUpload } from "src/buisness-photo/interfaces/business-photo.interface";
import { assertFileExists, assertValidImageFile } from "./assertFile";

describe('assertFile', () => {
    describe('assertFileExists', () => {
        it('should not throw if files are provided', () => {
            const files: FileUpload[] = [
                { buffer: Buffer.from('file1'), originalName: 'photo1.jpg' },
                { buffer: Buffer.from('file2'), originalName: 'photo2.png' },
            ];
            expect(() => assertFileExists(files)).not.toThrow();
        });

        it('should throw an error if no files are provided', () => {
            expect(() => assertFileExists(undefined)).toThrow('At least one picture file is required');
            expect(() => assertFileExists([] as FileUpload[])).toThrow('At least one picture file is required');
            expect(() => assertFileExists([])).toThrow('At least one picture file is required');
        });
    })
    describe('assertValidImageFile', () => {
        it('should not throw for valid image files', () => {
            const file: Express.Multer.File = {
                buffer: Buffer.from('valid image'),
                originalname: 'image.jpg',
                mimetype: 'image/jpeg',
                size: 1024,
            } as Express.Multer.File;
            expect(() => assertValidImageFile(file)).not.toThrow();
        });

        it('should throw for invalid file types', () => {
            const file: Express.Multer.File = {
                buffer: Buffer.from('invalid image'),
                originalname: 'document.pdf',
                mimetype: 'application/pdf',
                size: 1024,
            } as Express.Multer.File;
            expect(() => assertValidImageFile(file)).toThrow('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
        });

        it('should throw for files exceeding size limit', () => {
            const file: Express.Multer.File = {
                buffer: Buffer.from('large image'),
                originalname: 'large_image.jpg',
                mimetype: 'image/jpeg',
                size: 6 * 1024 * 1024, // 6MB
            } as Express.Multer.File;
            expect(() => assertValidImageFile(file)).toThrow('File size too large. Maximum size is 5MB.');
        });
    });
})