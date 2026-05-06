import { Video } from './Video';
import { VideoStatus } from './VideoStatus';

describe('Video Entity', () => {
  it('should create a video successfully', () => {
    const video = new Video('123', 'user1', 'test.mp4', VideoStatus.PENDING, new Date());
    expect(video.id).toBe('123');
    expect(video.status).toBe(VideoStatus.PENDING);
  });

  it('should mark as uploaded if pending', () => {
    const video = new Video('123', 'user1', 'test.mp4', VideoStatus.PENDING, new Date());
    video.markAsUploaded();
    expect(video.status).toBe(VideoStatus.UPLOADED);
  });

  it('should throw error if marking as uploaded from an invalid status', () => {
    const video = new Video('123', 'user1', 'test.mp4', VideoStatus.COMPLETED, new Date());
    expect(() => video.markAsUploaded()).toThrow();
  });
});
