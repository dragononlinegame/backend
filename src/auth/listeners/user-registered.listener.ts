import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRegisteredEvent } from '../events/userRegisteredEvent';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserRegisteredListener {
  constructor(private readonly databaseService: DatabaseService) {}

  async generateTeamConfig(userId: number, uplineId: number, lvl: number) {
    if (lvl - parseInt(process.env.LEVEL_COUNT as string) > 0) return;

    await this.databaseService.teamConfig.create({
      data: {
        userId: userId,
        uplineId: uplineId,
        level: lvl,
      },
    });

    const referrer_of_referrer =
      await this.databaseService.teamConfig.findFirst({
        where: {
          userId: uplineId,
          level: 1,
        },
      });

    if (!referrer_of_referrer) return;

    await this.generateTeamConfig(
      userId,
      referrer_of_referrer.uplineId,
      lvl + 1,
    );
  }

  @OnEvent('user.registered', { async: true })
  async handleUserRegisteredEvent(payload: UserRegisteredEvent) {
    console.log(payload.userId);
    console.log(payload.referrerId);

    await this.generateTeamConfig(payload.userId, payload.referrerId, 1);
  }
}
