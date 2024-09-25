import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Headers,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Event, Status } from '@prisma/client';
import {
  CreateEventDto,
  EventMapper,
  EventResponse,
  CreateParticipantDto,
  ParticipantResponse,
} from './dtos/createEvent.dto';
import { PrismaService } from 'src/prisma.service';
import { randomUUID } from 'crypto';
import {
  CreateTerminStatusDto,
  TerminStatusResponse,
} from './dtos/TerminStatus.dto';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getHello(): Promise<Event[]> {
    return await this.appService.getHello();
  }

  @Post('rest/events')
  async createEvent(
    @Body() createEventDto: CreateEventDto,
  ): Promise<EventResponse> {
    const eventData = EventMapper.toPrismaCreateInput(createEventDto);
    console.log(eventData);
    const event = await this.prisma.event.create({
      data: eventData,
    });
    const owner = await this.prisma.participant.create({
      data: {
        event_id: event.event_id,
        name: createEventDto.owner,
        is_organizer: true,
      },
    });
    return EventMapper.toDto(event, owner);
  }

  @Post('rest/events/:id/paricipants')
  async createParticipant(
    @Body() createParticipantDto: CreateParticipantDto,
    @Param('id') id: string,
  ): Promise<ParticipantResponse> {
    const participant = await this.prisma.participant.create({
      data: {
        participant_id: randomUUID(),
        event_id: id,
        name: createParticipantDto.name,
      },
    });
    return participant;
  }

  @Post('rest/events/:id/statuses')
  async createTerminStatus(
    @Body() createTerminStatusDto: CreateTerminStatusDto,
    @Param('id') id: string,
    @Headers('Participant') participant_id: string,
  ): Promise<TerminStatusResponse> {
    console.log(id);
    console.log(participant_id);
    const terminStatus = await this.prisma.terminStatus.upsert({
      where:{
        day_event_id_participant_id: {
        day: createTerminStatusDto.day,
        event_id: id,
        participant_id: participant_id,
      }},
      create: {
        day: createTerminStatusDto.day,
        event_id: id,
        participant_id,
        status: createTerminStatusDto.status,
      },
      update:{
        status: createTerminStatusDto.status
      }
    });
    return terminStatus;
  }

  @Get('rest/events/:id')
  async getEventById(@Param('id') id: string): Promise<EventResponse> {
    const event = await this.prisma.event.findUnique({
      where: { event_id: id },
      include: {
        Participants: true,
      },
    });

    const owner = event.Participants.find((p) => p.is_organizer);
    return EventMapper.toDto(event, owner);
  }

  @Get('rest/events/:id/statuses')
  async getTerminStatus(@Param('id') event_id: string): Promise<TerminStatusResponse[]> {
    const TerminStatuses = await this.prisma.terminStatus.findMany({
      where: { event_id: event_id },
    });

    const response = TerminStatuses.map(status => ({
      day: status.day,
      status: status.status,
      participant_id: status.participant_id,
      event_id: status.event_id,
      termin_status_id: status.termin_status_id
    }));

    return response;
  }
}
