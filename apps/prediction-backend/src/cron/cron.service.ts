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


  // PROFITS
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async dailyProfitAudit()
  {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set the time to midnight

    // Calculate the start date of 12 months ago
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - 1);

    const endDate = new Date(currentDate);

    const bets = await this.databaseService.bet.aggregate({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      _sum: {
        amount: true
      }
    })

    const wins = await this.databaseService.win.aggregate({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      _sum: {
        winAmount: true
      }
    })

    const betAmount = Number(bets._sum.amount);
    const winAmount = Number(wins._sum.winAmount);
    const profit = betAmount - winAmount;

    await this.databaseService.profit.create({
      data: {
        createdAt: startDate,
        betAmount,
        winAmount,
        profitAmount: profit,
        type: "Daily"
      }
    })
  }

  @Cron(CronExpression.EVERY_WEEK)
  async weeklyProfitAudit()
  {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set the time to midnight

    // Calculate the start date of 12 months ago
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - 7);

    const endDate = new Date(currentDate);

    const bets = await this.databaseService.bet.aggregate({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      _sum: {
        amount: true
      }
    })

    const wins = await this.databaseService.win.aggregate({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      _sum: {
        winAmount: true
      }
    })

    const betAmount = Number(bets._sum.amount);
    const winAmount = Number(wins._sum.winAmount);
    const profit = betAmount - winAmount;

    await this.databaseService.profit.create({
      data: {
        createdAt: startDate,
        betAmount,
        winAmount,
        profitAmount: profit,
        type: "Weekly"
      }
    })
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async monthlyProfitAudit()
  {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set the time to midnight

    // Calculate the start date of 12 months ago
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getMonth() - 1);

    const endDate = new Date(currentDate);

    const bets = await this.databaseService.bet.aggregate({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      _sum: {
        amount: true
      }
    })

    const wins = await this.databaseService.win.aggregate({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      _sum: {
        winAmount: true
      }
    })

    const betAmount = Number(bets._sum.amount);
    const winAmount = Number(wins._sum.winAmount);
    const profit = betAmount - winAmount;

    await this.databaseService.profit.create({
      data: {
        createdAt: startDate,
        betAmount,
        winAmount,
        profitAmount: profit,
        type: "Monthly"
      }
    })
  }
}
