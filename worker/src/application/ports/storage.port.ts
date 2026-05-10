export interface IStoragePort {
  downloadFile(bucket: string, objectName: string, destination: string): Promise<void>;
  uploadFiles(bucket: string, prefix: string, files: string[]): Promise<string[]>;
}
