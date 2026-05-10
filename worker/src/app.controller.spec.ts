import { AppController } from './app.controller';
import { ProcessVideoUseCase } from './application/usecases/process-video.usecase';
import { RmqContext } from '@nestjs/microservices';

describe('AppController', () => {
  let appController: AppController;
  let useCase: jest.Mocked<ProcessVideoUseCase>;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as any;

    appController = new AppController(useCase);
  });

  it('should process video and ack message', async () => {
    const mockChannel = { ack: jest.fn(), nack: jest.fn() };
    const mockMsg = { content: 'test' };
    const mockContext = {
      getChannelRef: () => mockChannel,
      getMessage: () => mockMsg,
    } as unknown as RmqContext;

    useCase.execute.mockResolvedValue(undefined);

    await appController.handleVideoUploaded(
      { videoId: 'vid1', bucket: 'raw', objectKey: 'test.mp4' },
      mockContext,
    );

    expect(useCase.execute).toHaveBeenCalledWith('vid1', 'raw', 'test.mp4');
    expect(mockChannel.ack).toHaveBeenCalledWith(mockMsg);
  });

  it('should nack message on error', async () => {
    const mockChannel = { ack: jest.fn(), nack: jest.fn() };
    const mockMsg = { content: 'test' };
    const mockContext = {
      getChannelRef: () => mockChannel,
      getMessage: () => mockMsg,
    } as unknown as RmqContext;

    useCase.execute.mockRejectedValue(new Error('Test Error'));

    await appController.handleVideoUploaded(
      { videoId: 'vid1', bucket: 'raw', objectKey: 'test.mp4' },
      mockContext,
    );

    expect(mockChannel.nack).toHaveBeenCalledWith(mockMsg, false, false);
  });
});
