import { Injectable } from '@nestjs/common';
import { Event } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}
  async getHello(): Promise<Event[]> {
    return await this.prismaService.event.findMany();
  }
}
