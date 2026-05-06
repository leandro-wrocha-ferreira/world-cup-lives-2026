import { Controller, Post, Body } from '@nestjs/common';
import { GenerateUploadUrlUseCase } from '../../application/usecases/GenerateUploadUrlUseCase';

class UploadRequestDto {
  userId: string;
  originalFilename: string;
  contentType: string;
}

@Controller('upload')
export class UploadController {
  constructor(private readonly generateUploadUrlUseCase: GenerateUploadUrlUseCase) {}

  @Post('presigned-url')
  async getPresignedUrl(@Body() body: UploadRequestDto) {
    const result = await this.generateUploadUrlUseCase.execute(
      body.userId,
      body.originalFilename,
      body.contentType
    );
    return result;
  }
}
