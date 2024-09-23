import { Status, TerminStatus } from "@prisma/client";

export interface CreateTerminStatusDto {
  day: Date,
  status: Status,
}

export interface TerminStatusResponse{
  day: Date,
  event_id: string,
  participant_id: string,
  termin_status_id: string,
  status: Status
}