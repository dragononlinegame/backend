import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BetEvent } from '../events/betEvent';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class BetListener {
  constructor(private readonly databaseService: DatabaseService) {}

  private LevelIncome = {
    1: 0.008,
    2: 0.005,
    3: 0.003,
    4: 0.002,
    5: 0.001,
  };

  @OnEvent('bet.created', { async: true })
  async handleResultAnnouncedEvent(payload: BetEvent) {
    console.log(payload.userId);
    console.log(payload.betAmount);

    const Commissions = [];

    for (let tier = 1; tier <= Object.keys(this.LevelIncome).length; tier++) {
      const referrer = await this.databaseService.teamConfig.findFirst({
        where: {
          userId: payload.userId,
          level: tier,
        },
      });

      if (!referrer) break;

      const commissionAmount = payload.betAmount * this.LevelIncome[tier];

      Commissions.push({
        amount: commissionAmount,
        fromId: payload.userId,
        toId: referrer.uplineId,
        level: tier,
      });

      // if (tier === 1) {
      //   await this.databaseService.user.update({
      //     where: {
      //       id: referrer.uplineId,
      //     },
      //     data: {
      //       daily_team_trade: {
      //         increment: originalBetAmount,
      //       },
      //       monthly_team_trade: {
      //         increment: originalBetAmount,
      //       },
      //     },
      //   });
      // }
    }

    await this.databaseService.commission.createMany({
      data: Commissions,
    });
  }
}
