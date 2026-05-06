export interface IStorageService {
  generatePresignedUploadUrl(filename: string, contentType: string): Promise<string>;
}
export const IStorageService = Symbol('IStorageService');
