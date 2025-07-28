import { FileUpload } from "src/buisness-photo/interfaces/business-photo.interface";
import { assertFileExists } from "./assertFile";

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
})