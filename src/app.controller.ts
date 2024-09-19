import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { Event } from '@prisma/client';
import { CreateEventDto, EventMapper, EventResponse,
CreateParticipantDto, ParticipantResponse} from './dtos/createEvent.dto';
import { PrismaService } from 'src/prisma.service';
import { randomUUID } from 'crypto';


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
     const owner = await this.prisma.participant.create({
      data: {
        event_id: event.event_id,
        name: createEventDto.owner,
        is_organizer: true
      }
     })
     return EventMapper.toDto(event, owner);
    }

    @Post('rest/events/:id/paricipants')
  async createParticipant(@Body() createParticipantDto: CreateParticipantDto,@Param('id') id: string): Promise<ParticipantResponse>
   {
    const participant = await this.prisma.participant.create({
      data: {
        participant_id: randomUUID(),
        event_id: id,
        name: createParticipantDto.name,
      },
    });
    return participant;
  }
}

