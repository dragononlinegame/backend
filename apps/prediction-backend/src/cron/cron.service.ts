import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bull';
import { DatabaseService } from '../database/database.service';
import { GamesService } from '../games/games.service';

@Injectable()
export class CronJobService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly gamesService: GamesService,
    @InjectQueue('commission-processing')
    private readonly commissionProcessingQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  issueNewGameT1() {
    return this.gamesService.issueNewGame();
  }

  @Cron('*/3 * * * *')
  issueNewGameT2() {
    return this.gamesService.issueNewGame(1);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  issueNewGameT3() {
    return this.gamesService.issueNewGame(2);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // @Cron(CronExpression.EVERY_MINUTE)
  async sendCommissions() {
    const commissions = await this.databaseService.commission.groupBy({
      by: ['toId'],
      orderBy: {
        toId: 'asc',
      },
      where: {
        isPaid: false,
      },
      _sum: {
        amount: true,
      },
    });

    // Send each commission individually into the "commission-processing" queue
    for (const commission of commissions) {
      const amount = Number(commission._sum.amount);

      if (amount > 0) {
        await this.commissionProcessingQueue.add(
          'processCommission',
          {
            to: commission.toId,
            amount: amount,
          },
          { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
        );
      }
    }
  }
}
