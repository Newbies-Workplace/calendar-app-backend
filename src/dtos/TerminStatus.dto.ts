import { Status, TerminStatus } from '@prisma/client';
import {IsDateString, IsISO8601, IsEnum } from 'class-validator';

export class CreateTerminStatusDto {
  @IsISO8601({ strict: true }, { message: 'format daty to YYYY-MM-DD' })
    day: Date;
  
  @IsEnum (Status)
  status: Status;
}

export interface TerminStatusResponse {
  day: Date;
  event_id: string;
  participant_id: string;
  termin_status_id: string;
  status: Status;
}
