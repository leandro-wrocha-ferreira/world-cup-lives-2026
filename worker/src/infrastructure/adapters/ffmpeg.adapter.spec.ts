import { FFmpegAdapter } from './ffmpeg.adapter';
import * as ffmpeg from 'fluent-ffmpeg';

jest.mock('fluent-ffmpeg');

describe('FFmpegAdapter', () => {
  let adapter: FFmpegAdapter;

  beforeEach(() => {
    adapter = new FFmpegAdapter();
  });

  it('should initialize', () => {
    expect(adapter).toBeDefined();
  });
});
