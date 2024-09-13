import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { Event } from '@prisma/client';
import { CreateEventDto, EventMapper, EventResponse} from './dtos/createEvent.dto';
import { PrismaService } from 'src/prisma.service';


@Controller()

export class AppController {
  constructor(private readonly appService: AppService, private readonly prisma: PrismaService) {}

  @Get()
  async getHello(): Promise<Event[]> {
    return await this.appService.getHello();
  }

  @Post('rest/events')
  async createEvent(@Body() createEventDto: CreateEventDto):Promise<EventResponse> {
    const eventData = EventMapper.toPrismaCreateInput(createEventDto);
    console.log(eventData);
    const event = await this.prisma.event.create({
       data : eventData,
     });
     return EventMapper.toDto(event);
    }
}
