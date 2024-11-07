import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    BadRequestException,
  } from '@nestjs/common';
  import { PrismaService } from 'src/prisma.service';
  
  @Injectable()
  export class ParticipantGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const participantId = request.headers['participant'];
      const eventId = request.params.id;

      if (!participantId) {
        throw new UnauthorizedException('Brak nagłówka participant');
      }

      const participantExists = await this.prisma.participant.count({
        where: {
          participant_id: participantId,
          event_id: eventId,
        },
      });
  
      if (participantExists === 0) {
        throw new UnauthorizedException('Uczestnik nie jest powiązany z tym wydarzeniem');
      }
  
      return true;
    }
  }
  