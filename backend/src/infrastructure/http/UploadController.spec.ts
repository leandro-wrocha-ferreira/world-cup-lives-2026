import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './UploadController';
import { GenerateUploadUrlUseCase } from '../../application/usecases/GenerateUploadUrlUseCase';

describe('UploadController', () => {
  let controller: UploadController;
  let useCaseMock: any;

  beforeEach(async () => {
    useCaseMock = {
      execute: jest.fn().mockResolvedValue({ url: 'http://test.url', videoId: '1234' })
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        { provide: GenerateUploadUrlUseCase, useValue: useCaseMock }
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  it('should return a presigned url and video id', async () => {
    const body = { userId: 'u1', originalFilename: 'vid.mp4', contentType: 'video/mp4' };
    const result = await controller.getPresignedUrl(body);
    expect(result).toEqual({ url: 'http://test.url', videoId: '1234' });
    expect(useCaseMock.execute).toHaveBeenCalledWith('u1', 'vid.mp4', 'video/mp4');
  });
});
