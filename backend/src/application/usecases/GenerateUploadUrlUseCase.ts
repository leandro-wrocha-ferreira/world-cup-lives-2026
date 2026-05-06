import { Injectable, Inject } from '@nestjs/common';
import { IStorageService } from '../ports/IStorageService';
import { IVideoRepository } from '../ports/IVideoRepository';
import { Video } from '../../domain/video/Video';
import { VideoStatus } from '../../domain/video/VideoStatus';
import { randomUUID } from 'crypto';

@Injectable()
export class GenerateUploadUrlUseCase {
  constructor(
    @Inject(IStorageService) private readonly storageService: IStorageService,
    @Inject(IVideoRepository) private readonly videoRepository: IVideoRepository
  ) {}

  async execute(userId: string, originalFilename: string, contentType: string): Promise<{ url: string, videoId: string }> {
    const videoId = randomUUID();
    const objectKey = `uploads/${userId}/${videoId}/${originalFilename}`;
    
    // Generate S3 URL
    const uploadUrl = await this.storageService.generatePresignedUploadUrl(objectKey, contentType);

    // Create Video entity
    const video = new Video(
      videoId,
      userId,
      originalFilename,
      VideoStatus.PENDING,
      new Date()
    );

    // Save to DB
    await this.videoRepository.save(video);

    return { url: uploadUrl, videoId };
  }
}
