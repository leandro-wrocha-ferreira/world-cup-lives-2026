import { Injectable, Inject } from '@nestjs/common';
import { ITranscoderPort } from '../ports/transcoder.port';
import { IStoragePort } from '../ports/storage.port';
import { IMetadataPort } from '../ports/metadata.port';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class ProcessVideoUseCase {
  constructor(
    @Inject('ITranscoderPort') private readonly transcoder: ITranscoderPort,
    @Inject('IStoragePort') private readonly storage: IStoragePort,
    @Inject('IMetadataPort') private readonly metadata: IMetadataPort,
  ) {}

  async execute(videoId: string, bucket: string, objectKey: string): Promise<void> {
    const tempDir = path.join('/tmp', videoId);
    await fs.mkdir(tempDir, { recursive: true });
    
    const inputPath = path.join(tempDir, 'input.mp4');
    const hlsDir = path.join(tempDir, 'hls');
    const dashDir = path.join(tempDir, 'dash');
    
    await fs.mkdir(hlsDir, { recursive: true });
    await fs.mkdir(dashDir, { recursive: true });

    try {
      await this.metadata.updateVideoStatus(videoId, 'PROCESSING', {});
      
      await this.storage.downloadFile(bucket, objectKey, inputPath);

      const hlsFiles = await this.transcoder.transcodeToHLS(inputPath, hlsDir);
      const dashFiles = await this.transcoder.transcodeToDASH(inputPath, dashDir);

      const hlsUrls = await this.storage.uploadFiles('cdn-bucket', `videos/${videoId}/hls`, hlsFiles);
      const dashUrls = await this.storage.uploadFiles('cdn-bucket', `videos/${videoId}/dash`, dashFiles);

      const playlistUrl = hlsUrls.find(url => url.endsWith('.m3u8'));
      const manifestUrl = dashUrls.find(url => url.endsWith('.mpd'));

      await this.metadata.updateVideoStatus(videoId, 'COMPLETED', {
        hls: playlistUrl,
        dash: manifestUrl
      });
    } catch (error) {
      await this.metadata.updateVideoStatus(videoId, 'FAILED', {});
      throw error;
    } finally {
      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
