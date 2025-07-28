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
        throw new Error(message);
    }
}