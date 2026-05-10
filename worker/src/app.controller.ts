import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { ProcessVideoUseCase } from './application/usecases/process-video.usecase';

@Controller()
export class AppController {
  constructor(private readonly processVideoUseCase: ProcessVideoUseCase) {}

  @EventPattern('video.uploaded')
  async handleVideoUploaded(
    @Payload() data: { videoId: string; bucket: string; objectKey: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.processVideoUseCase.execute(data.videoId, data.bucket, data.objectKey);
      channel.ack(originalMsg);
    } catch (error) {
      console.error('Error processing video:', error);
      // Nack and do not requeue for now
      channel.nack(originalMsg, false, false);
    }
  }
}

