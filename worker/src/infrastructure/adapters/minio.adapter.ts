import { Injectable } from '@nestjs/common';
import { IStoragePort } from '../../application/ports/storage.port';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MinioAdapter implements IStoragePort {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'password123',
      },
      forcePathStyle: true,
    });
  }

  async downloadFile(bucket: string, objectName: string, destination: string): Promise<void> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: objectName });
    const response = await this.s3Client.send(command);
    
    if (response.Body) {
      const writeStream = fs.createWriteStream(destination);
      const readStream = response.Body as any;
      return new Promise((resolve, reject) => {
        readStream.pipe(writeStream)
          .on('error', reject)
          .on('finish', resolve);
      });
    }
    throw new Error('No body returned from MinIO');
  }

  async uploadFiles(bucket: string, prefix: string, files: string[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const fileName = path.basename(file);
      const key = `${prefix}/${fileName}`;
      const fileStream = fs.createReadStream(file);
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileStream,
      });
      await this.s3Client.send(command);
      urls.push(`http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${bucket}/${key}`);
    }
    return urls;
  }
}
