import { Event, EventStatus, Participant } from '@prisma/client';
import { randomUUID } from 'crypto';
import {
  IsString,
  Length,
  IsOptional,
  IsDateString,
  IsISO8601,
  IsNotEmpty,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @Length(3, 20, { message: 'Nazwa musi mięć między 3 a 20 znaków' })
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(3, 20, { message: 'Nazwa musi mięć między 3 a 20 znaków' })
  @IsNotEmpty()
  owner: string;

  @IsString()
  @IsOptional()
  @Length(0, 200, { message: 'Opis max 200 zmaków' })
  description: string | null;

  @IsISO8601({ strict: true }, { message: 'format daty to YYYY-MM-DD' })
  start: Date;

  @IsISO8601({ strict: true }, { message: 'format daty to YYYY-MM-DD' })
  end: Date;

  @IsDateString(
    { strict: true },
    { message: 'format daty to  YYYY-MM-DDThh:mm' },
  )
  voting_end: Date;
}

export class CreateParticipantDto {
  @IsString()
  @Length(3, 20, { message: 'Imię musi mięć między 3 a 20 znaków' })
  name: string;
}

export interface EventResponse {
  id: string;
  name: string;
  owner: ParticipantResponse;
  description: string;
  start: string;
  end: string;
  voting_end: string;
  status: EventStatus;
}

export interface ParticipantResponse {
  participant_id: string;
  event_id: string;
  name: string;
}

export class EventMapper {
  static toPrismaCreateInput(createEventDto: CreateEventDto): Event {
    return {
      event_id: randomUUID(),
      name: createEventDto.name,
      description: createEventDto.description,
      start: new Date(createEventDto.start),
      end: new Date(createEventDto.end),
      voting_end: new Date(createEventDto.voting_end),
      status: EventStatus.ACTIVE,
    };
  }
  static toDto(event: Event, owner: Participant): EventResponse {
    return {
      id: event.event_id,
      name: event.name,
      description: event.description,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      voting_end: event.voting_end.toISOString(),
      owner: {
        participant_id: owner.participant_id,
        event_id: owner.event_id,
        name: owner.name,
      },
      status: event.status,
    };
  }
}
