import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService } from '../../application/ports/IStorageService';

@Injectable()
export class S3StorageService implements IStorageService {
  private s3Client: S3Client;
  private bucketName = process.env.MINIO_BUCKET || 'videos';

  constructor() {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'password123',
      },
      forcePathStyle: true, // required for MinIO
    });
  }

  async generatePresignedUploadUrl(objectKey: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    // URL valid for 1 hour
    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
