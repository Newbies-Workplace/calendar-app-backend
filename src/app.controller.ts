import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Headers,
  Put,
  Patch,
  BadRequestException,
  HttpException,
  HttpStatus,
  Sse,
  UseGuards
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
import * as dayjs from 'dayjs'
import {filter, interval, map, Observable, Subject} from 'rxjs';
import { ParticipantGuard } from './app.guard';

const voteSubject = new Subject<TerminStatusResponse>();

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Sse('event/:id')
  sendEvent(
    @Param('id') id: string
  ): Observable<TerminStatusResponse> {
    return voteSubject.asObservable().pipe(filter((v: TerminStatusResponse) => v.event_id === id))
  }


  @Post('rest/events')
  async createEvent(
    @Body() createEventDto: CreateEventDto,): Promise<EventResponse> {
    await this.assert_compatibility_date(createEventDto.start, createEventDto.end)
    await this.assert_voting_end(createEventDto.voting_end)
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

  @Post('rest/events/:id/participants')
  async createParticipant(
    @Body() createParticipantDto: CreateParticipantDto,
    @Param('id') id: string,
  ): Promise<ParticipantResponse> {
    await this.assert_is_voting_open(id)
    const participant = await this.prisma.participant.create({
      data: {
        participant_id: randomUUID(),
        event_id: id,
        name: createParticipantDto.name,
      },
    });
    return participant;
  }

  
  @Put('rest/events/:id/statuses')
  @UseGuards(ParticipantGuard)
  async createTerminStatus(
    @Body() createTerminStatusDto: CreateTerminStatusDto,
    @Param('id') id: string,
    @Headers('Participant') participant_id: string,
  ): Promise<TerminStatusResponse> {
    await this.assert_is_voting_open(id)
    await this.assert_event_exist(id)
    await this.assert_participant_exist(participant_id)
    const terminStatus = await this.prisma.terminStatus.upsert({
      where:{
        day_event_id_participant_id: {
        day: new Date(createTerminStatusDto.day),
        event_id: id,
        participant_id: participant_id,
      }},
      create: {
        day: new Date(createTerminStatusDto.day),
        event_id: id,
        participant_id,
        status: createTerminStatusDto.status,
      },
      update:{
        status: createTerminStatusDto.status
      }
    });

    voteSubject.next(terminStatus);

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

  @Get('rest/events/:id/participants')
  async getParticipants(@Param('id') event_id: string): Promise<ParticipantResponse[]> {
    const Participants = await this.prisma.participant.findMany({
      where: { event_id: event_id },
    });
    const response = Participants.map(participant => ({
      name: participant.name,
      event_id: participant.event_id,
      participant_id: participant.participant_id
    }));

    return response;
  }

  @Get('rest/events/:id/statuses')
  async getTerminStatus(@Param('id') event_id: string): Promise<TerminStatusResponse[]> {
    await this.assert_event_exist(event_id)
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

  @Patch('rest/events/:id/complete')
  async completeEvent(
    @Param('id') event_id: string, 
  ): Promise<void> {
    await this.assert_event_exist(event_id)
    await this.assert_is_voting_open(event_id)
    const event = await this.prisma.event.findUnique({
      where: { event_id: event_id },
    });

      await this.prisma.event.update({
      where: { event_id: event_id },
      data: {
        status: 'COMPLETED',
      },
    });
  }

  async assert_event_exist(event_id:string) {
    const event_count = await this.prisma.event.count({
    where:{
     event_id: event_id
    }})
  if (event_count != 1){
    throw new HttpException(`Event z id ${event_id} nie istnieje`, HttpStatus.BAD_REQUEST)
  }}

  async assert_participant_exist(participant_id:string) {
    const participant_count = await this.prisma.participant.count({
    where:{
     participant_id: participant_id
    }})
  if (participant_count != 1){
    throw new HttpException(`Uczestnik z id ${participant_id} nie istnieje`, HttpStatus.BAD_REQUEST)
  }}

  async assert_compatibility_date(start_date: Date, end_date: Date){
    if (start_date > end_date) {
      throw new HttpException('Data startu nie może być po dacie zakończenia wydarzenia.', HttpStatus.BAD_REQUEST);
}}

  async assert_voting_end(voting_date: Date){
  const current_date = new Date();
  if (current_date > voting_date) {
    throw new HttpException('Nieprawidłowo podano datę zakończenia głosowania', HttpStatus.BAD_REQUEST);
  }}

  async assert_is_voting_open(event_id: string) {
  const event = await this.prisma.event.findUnique({
    where: { event_id: event_id },
    select: {
      end: true,
      voting_end : true
     }
  });

    const current_date = dayjs();
    const end_date = dayjs(event.end);
    const voting_end_date = dayjs(event.voting_end);

    if (end_date.isBefore(current_date)) {
      throw new HttpException('Głosowanie na to wydarzenie zostało zakończone.', HttpStatus.BAD_REQUEST);
    }
    if (voting_end_date.isBefore(current_date)) {
      throw new HttpException('Głosowanie na to wydarzenie zostało zakończone.', HttpStatus.BAD_REQUEST);
    }

  }
}