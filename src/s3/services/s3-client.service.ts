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
import * as mime from 'mime-types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3ClientService {
  private readonly s3: S3Client;
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME;
  private readonly logger = new Logger(S3ClientService.name);

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('aws.region', { infer: true });
    const accessKeyId = this.configService.getOrThrow<string>('aws.credentials.accessKeyId', { infer: true });
    const secretAccessKey = this.configService.getOrThrow<string>('aws.credentials.secretAccessKey', { infer: true });
    this.bucketName = this.configService.get<string>('aws.bucketName', { infer: true });

    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Uploads a file to S3.
   *
   * @param buffer - The file buffer to upload.
   * @param key - The S3 key (path) where the file will be stored.
   * @param originalName - The original name of the file, used for setting the content type.
   * @throws InternalServerErrorException if the upload fails.
   */
  async uploadFile(
    buffer: Buffer,
    key: string,
    originalName: string,
  ): Promise<void> {
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: mime.lookup(originalName) || 'application/octet-stream',
        }),
      );
    } catch (error) {
      this.logger.error(
        `S3 upload of file with name ${originalName} and key ${key} failed.`,
        error,
      );
      throw new InternalServerErrorException(
        `S3 upload of file with name ${originalName} and key ${key} failed.`,
      );
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
      this.logger.error('S3 delete failed', error);
      throw new InternalServerErrorException('S3 delete failed');
    }
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
}
