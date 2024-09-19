import { Event, Participant } from "@prisma/client";
import { randomUUID } from "crypto";

export interface CreateEventDto {
    name: string;
    owner: string;
    description: string|null;
    start: Date;
    end: Date;
    voting_end: Date;
}

export class CreateParticipantDto {
    name: string;
  }

export interface EventResponse{
    id: string;
    name: string;
    owner: ParticipantResponse;
    description: string;
    start: string;
    end: string;
    voting_end: string;
}

export interface ParticipantResponse{
    participant_id: string;
    name: string;
}

export class EventMapper {
    static toPrismaCreateInput(createEventDto: CreateEventDto):Event {
      return {
        event_id: randomUUID(),
        name: createEventDto.name,
        description: createEventDto.description,
        start: new Date(createEventDto.start),
        end: new Date(createEventDto.end),
        voting_end: new Date(createEventDto.voting_end)
      };    
    }
    static toDto(event: Event, owner: Participant):EventResponse {
        return {
          id: event.event_id,
          name: event.name,
          description: event.description,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
          voting_end: event.voting_end.toISOString(),
          owner: {participant_id:owner.participant_id, name:owner.name}
        };
  }
  
}



