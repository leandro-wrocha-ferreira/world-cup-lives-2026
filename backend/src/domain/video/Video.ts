import { VideoStatus } from './VideoStatus';

export class Video {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly originalFilename: string,
    public status: VideoStatus,
    public createdAt: Date,
    public metadata?: Record<string, any>
  ) {}

  public markAsUploaded(): void {
    if (this.status !== VideoStatus.PENDING && this.status !== VideoStatus.UPLOADING) {
      throw new Error('Video must be PENDING or UPLOADING to be marked as UPLOADED');
    }
    this.status = VideoStatus.UPLOADED;
  }
}
