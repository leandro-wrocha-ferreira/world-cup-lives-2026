import { ProcessVideoUseCase } from './process-video.usecase';
import { ITranscoderPort } from '../ports/transcoder.port';
import { IStoragePort } from '../ports/storage.port';
import { IMetadataPort } from '../ports/metadata.port';

describe('ProcessVideoUseCase', () => {
  let useCase: ProcessVideoUseCase;
  let mockTranscoder: jest.Mocked<ITranscoderPort>;
  let mockStorage: jest.Mocked<IStoragePort>;
  let mockMetadata: jest.Mocked<IMetadataPort>;

  beforeEach(() => {
    mockTranscoder = {
      transcodeToHLS: jest.fn().mockResolvedValue(['/tmp/mock/playlist.m3u8']),
      transcodeToDASH: jest.fn().mockResolvedValue(['/tmp/mock/manifest.mpd']),
    };

    mockStorage = {
      downloadFile: jest.fn().mockResolvedValue(undefined),
      uploadFiles: jest.fn().mockImplementation((bucket, prefix, files) => 
        Promise.resolve(files.map(f => `http://mock/${bucket}/${prefix}/${f.split('/').pop()}`))
      ),
    };

    mockMetadata = {
      updateVideoStatus: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new ProcessVideoUseCase(mockTranscoder, mockStorage, mockMetadata);
  });

  it('should download, transcode, upload, and update metadata', async () => {
    await useCase.execute('vid123', 'raw-bucket', 'raw/vid123.mp4');

    expect(mockMetadata.updateVideoStatus).toHaveBeenCalledWith('vid123', 'PROCESSING', {});
    expect(mockStorage.downloadFile).toHaveBeenCalledWith('raw-bucket', 'raw/vid123.mp4', expect.any(String));
    
    expect(mockTranscoder.transcodeToHLS).toHaveBeenCalled();
    expect(mockTranscoder.transcodeToDASH).toHaveBeenCalled();

    expect(mockStorage.uploadFiles).toHaveBeenCalledTimes(2);

    expect(mockMetadata.updateVideoStatus).toHaveBeenCalledWith(
      'vid123', 
      'COMPLETED', 
      expect.objectContaining({
        hls: expect.stringContaining('playlist.m3u8'),
        dash: expect.stringContaining('manifest.mpd'),
      })
    );
  });

  it('should update metadata to FAILED on error', async () => {
    mockStorage.downloadFile.mockRejectedValue(new Error('S3 Down'));

    await expect(useCase.execute('vid123', 'raw-bucket', 'raw/vid123.mp4')).rejects.toThrow('S3 Down');

    expect(mockMetadata.updateVideoStatus).toHaveBeenCalledWith('vid123', 'PROCESSING', {});
    expect(mockMetadata.updateVideoStatus).toHaveBeenCalledWith('vid123', 'FAILED', {});
  });
});
