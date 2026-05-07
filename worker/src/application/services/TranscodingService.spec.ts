import { Test, TestingModule } from '@nestjs/testing';
import { TranscodingService } from './TranscodingService';
import * as child_process from 'child_process';
import * as fs from 'fs/promises';

jest.mock('child_process', () => ({
  exec: jest.fn((cmd, cb) => cb(null, { stdout: 'mock', stderr: '' })),
}));

jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
}));

describe('TranscodingService', () => {
  let service: TranscodingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TranscodingService],
    }).compile();

    service = module.get<TranscodingService>(TranscodingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should transcode video to HLS and DASH', async () => {
    await service.transcodeVideo('input.mp4', 'output');
    
    // Ensure directories are created
    expect(fs.mkdir).toHaveBeenCalledWith('output', { recursive: true });
    
    // Ensure exec was called for HLS and DASH
    expect(child_process.exec).toHaveBeenCalledTimes(2);
  });
});
