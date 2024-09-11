
export interface CreateEventDto {
    name: string;
    owner: string;
    description: string;
    event_start: Date;
    event_end: Date;
    voting_end: Date;
}

interface EventResponse{
    id: string;
    name: string;
    owner: ParticipantResponse;
    description: string;
    event_start: Date;
    event_end: Date;
    voting_end: Date;
}

interface ParticipantResponse{
    id: string;
    name: string;
}