export interface IMetadataPort {
  updateVideoStatus(videoId: string, status: string, urls: { hls?: string, dash?: string }): Promise<void>;
}
