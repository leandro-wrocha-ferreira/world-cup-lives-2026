import { Injectable } from '@nestjs/common';
import { ITranscoderPort } from '../../application/ports/transcoder.port';
import * as path from 'path';
import * as fs from 'fs/promises';

const ffmpeg = require('fluent-ffmpeg');

@Injectable()
export class FFmpegAdapter implements ITranscoderPort {
  async transcodeToHLS(inputPath: string, outputDir: string): Promise<string[]> {
    const playlistName = 'playlist.m3u8';
    const outputPath = path.join(outputDir, playlistName);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-profile:v baseline',
          '-level 3.0',
          '-start_number 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-f hls'
        ])
        .output(outputPath)
        .on('end', async () => {
          const files = await fs.readdir(outputDir);
          resolve(files.map(f => path.join(outputDir, f)));
        })
        .on('error', (err: Error) => {
          reject(err);
        })
        .run();
    });
  }

  async transcodeToDASH(inputPath: string, outputDir: string): Promise<string[]> {
    const manifestName = 'manifest.mpd';
    const outputPath = path.join(outputDir, manifestName);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-f dash',
          '-seg_duration 10',
          '-use_template 1',
          '-use_timeline 1',
          '-init_seg_name init-$RepresentationID$.m4s',
          '-media_seg_name chunk-$RepresentationID$-$Number%05d$.m4s'
        ])
        .output(outputPath)
        .on('end', async () => {
          const files = await fs.readdir(outputDir);
          resolve(files.map(f => path.join(outputDir, f)));
        })
        .on('error', (err: Error) => {
          reject(err);
        })
        .run();
    });
  }
}

