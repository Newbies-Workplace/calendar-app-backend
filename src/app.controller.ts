import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Event } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<Event[]> {
    return await this.appService.getHello();
  }

  //@Post()
}
