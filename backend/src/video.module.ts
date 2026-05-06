import { Module } from '@nestjs/common';
import { GenerateUploadUrlUseCase } from './application/usecases/GenerateUploadUrlUseCase';
import { IStorageService } from './application/ports/IStorageService';
import { IVideoRepository } from './application/ports/IVideoRepository';
import { S3StorageService } from './infrastructure/storage/S3StorageService';
import { CassandraVideoRepository } from './infrastructure/database/CassandraVideoRepository';
import { UploadController } from './infrastructure/http/UploadController';

@Module({
  controllers: [UploadController],
  providers: [
    GenerateUploadUrlUseCase,
    {
      provide: IStorageService,
      useClass: S3StorageService,
    },
    {
      provide: IVideoRepository,
      useClass: CassandraVideoRepository,
    },
  ],
})
export class VideoModule {}
