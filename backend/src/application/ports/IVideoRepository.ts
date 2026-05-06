import { Video } from '../../domain/video/Video';

export interface IVideoRepository {
  save(video: Video): Promise<void>;
  findById(id: string): Promise<Video | null>;
}
export const IVideoRepository = Symbol('IVideoRepository');
