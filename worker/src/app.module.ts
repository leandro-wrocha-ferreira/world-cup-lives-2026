import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TranscodingService } from './application/services/TranscodingService';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, TranscodingService],
})
export class AppModule {}
