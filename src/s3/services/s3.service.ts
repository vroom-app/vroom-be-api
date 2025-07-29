import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as mime from 'mime-types';
import { S3ClientService } from './s3-client.service';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly s3Client: S3ClientService) {}

  async uploadFile(
    buffer: Buffer,
    originalName: string,
    folder: string,
  ): Promise<string> {
    const fileExtension = mime.extension(originalName) || 'jpg';
    const key = `${folder}/${uuidv4()}.${fileExtension}`;

    await this.s3Client.uploadFile(buffer, key, originalName);
    return this.s3Client.getPublicUrl(key);
  }

  async deleteFileFromUrl(url: string): Promise<void> {
    try {
      const key = this.extractKeyFromUrl(url);
      await this.deleteFileByKey(key);
    } catch (error) {
      this.logger.warn(`Failed to delete file from S3: ${url}`, error);
    }
  }

  private async deleteFileByKey(key: string): Promise<void> {
    await this.s3Client.deleteFile(key);
  }

  private extractKeyFromUrl(url: string): string {
    const urlParts = url.split('/');
    return urlParts.slice(-2).join('/'); // Get the last two parts (folder/filename)
  }
}
