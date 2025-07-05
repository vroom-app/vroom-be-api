import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as mime from 'mime-types';
import { s3Config } from './s3.config';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME;
  private readonly logger = new Logger(S3Service.name);

  constructor() {
    this.s3 = new S3Client({
      region: s3Config.region,
      credentials: s3Config.credentials,
    });
  }

  async uploadFile(
    buffer: Buffer,
    originalName: string,
    folder: string,
  ): Promise<string> {
    const fileExtension = mime.extension(originalName) || 'jpg';
    const key = `${folder}/${uuidv4()}.${fileExtension}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: mime.lookup(originalName) || 'image/jpeg',
          ACL: 'public-read',
        }),
      );

      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      this.logger.error('Failed to upload to S3', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error('Failed to delete from S3', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }
}
