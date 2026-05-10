export interface ITranscoderPort {
  transcodeToHLS(inputPath: string, outputDir: string): Promise<string[]>;
  transcodeToDASH(inputPath: string, outputDir: string): Promise<string[]>;
}
