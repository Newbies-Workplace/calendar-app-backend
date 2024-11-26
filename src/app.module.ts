import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ParticipantGuard } from './app.guard';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService, ParticipantGuard],
})
export class AppModule {}
