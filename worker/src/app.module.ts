import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProcessVideoUseCase } from './application/usecases/process-video.usecase';
import { FFmpegAdapter } from './infrastructure/adapters/ffmpeg.adapter';
import { MinioAdapter } from './infrastructure/adapters/minio.adapter';
import { CassandraAdapter } from './infrastructure/adapters/cassandra.adapter';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    ProcessVideoUseCase,
    { provide: 'ITranscoderPort', useClass: FFmpegAdapter },
    { provide: 'IStoragePort', useClass: MinioAdapter },
    { provide: 'IMetadataPort', useClass: CassandraAdapter },
  ],
})
export class AppModule {}
