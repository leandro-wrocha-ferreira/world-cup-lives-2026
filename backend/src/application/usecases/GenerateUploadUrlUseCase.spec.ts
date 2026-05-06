import { GenerateUploadUrlUseCase } from './GenerateUploadUrlUseCase';
import { IStorageService } from '../ports/IStorageService';
import { IVideoRepository } from '../ports/IVideoRepository';

describe('GenerateUploadUrlUseCase', () => {
  let useCase: GenerateUploadUrlUseCase;
  let mockStorageService: jest.Mocked<IStorageService>;
  let mockVideoRepository: jest.Mocked<IVideoRepository>;

  beforeEach(() => {
    mockStorageService = {
      generatePresignedUploadUrl: jest.fn().mockResolvedValue('http://mocked-url.com/upload'),
    };
    mockVideoRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
    };
    useCase = new GenerateUploadUrlUseCase(mockStorageService, mockVideoRepository);
  });

  it('should generate url and save video', async () => {
    const result = await useCase.execute('user1', 'file.mp4', 'video/mp4');
    expect(result.url).toBe('http://mocked-url.com/upload');
    expect(result.videoId).toBeDefined();
    expect(mockStorageService.generatePresignedUploadUrl).toHaveBeenCalled();
    expect(mockVideoRepository.save).toHaveBeenCalled();
  });
});
