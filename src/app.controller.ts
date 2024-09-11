import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { Event } from '@prisma/client';
import { CreateEventDto } from './dtos/createEvent.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<Event[]> {
    return await this.appService.getHello();
  }

  @Post('rest/events')
    createEvent(@Body() createEventDto: CreateEventDto) {
      console.log(createEventDto);
    }
}
