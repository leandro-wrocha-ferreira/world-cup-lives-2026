import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

@Injectable()
export class TranscodingService {
  private readonly logger = new Logger(TranscodingService.name);

  async transcodeVideo(inputFilePath: string, outputDir: string): Promise<void> {
    this.logger.log(`Starting transcoding for ${inputFilePath}`);
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    const hlsOutputDir = path.join(outputDir, 'hls');
    const dashOutputDir = path.join(outputDir, 'dash');
    
    await fs.mkdir(hlsOutputDir, { recursive: true });
    await fs.mkdir(dashOutputDir, { recursive: true });

    const hlsOutput = path.join(hlsOutputDir, 'playlist.m3u8');
    const dashOutput = path.join(dashOutputDir, 'manifest.mpd');

    // Transcode to HLS (720p example)
    const hlsCommand = `ffmpeg -i ${inputFilePath} -profile:v main -vf scale=-2:720 -c:v libx264 -c:a aac -f hls -hls_time 4 -hls_playlist_type vod -hls_segment_filename "${hlsOutputDir}/segment_%03d.ts" ${hlsOutput}`;
    
    // Transcode to DASH (720p example)
    const dashCommand = `ffmpeg -i ${inputFilePath} -profile:v main -vf scale=-2:720 -c:v libx264 -c:a aac -f dash -seg_duration 4 -use_template 1 -use_timeline 1 -init_seg_name "init-\\$RepresentationID\\$.m4s" -media_seg_name "chunk-\\$RepresentationID\\$-\\$Number\\$.m4s" ${dashOutput}`;

    try {
      this.logger.log('Generating HLS...');
      await execAsync(hlsCommand);
      
      this.logger.log('Generating DASH...');
      await execAsync(dashCommand);
      
      this.logger.log(`Transcoding completed successfully for ${inputFilePath}`);
    } catch (error) {
      this.logger.error(`Error during transcoding: ${error.message}`);
      throw error;
    }
  }
}
