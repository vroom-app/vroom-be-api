import { Module } from '@nestjs/common';
import { S3Service } from './services/s3.service';
import { S3ClientService } from './services/s3-client.service';

@Module({
  providers: [
    S3Service, 
    S3ClientService
  ],
  exports: [
    S3Service
  ],
})
export class S3Module {}
