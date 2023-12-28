import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getUserDataForLast12Months() {
    const currentDate = new Date(new Date().setDate(1));
    currentDate.setHours(0, 0, 0, 0); // Set the time to midnight

    // Calculate the start date of 12 months ago
    const startDate = new Date(currentDate);
    startDate.setMonth(startDate.getMonth() - 11);

    const endDate = new Date(currentDate);

    const monthlyData: { [key: string]: unknown }[] = [];

    while (startDate <= endDate) {
      const monthName = startDate.toLocaleDateString('en-US', {
        month: 'short',
      });

      const userCount = await this.databaseService.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lt: new Date(
              new Date(startDate).setMonth(startDate.getMonth() + 1),
            ),
          },
        },
      });

      monthlyData.push({ month: monthName, count: userCount });
      startDate.setMonth(startDate.getMonth() + 1);
    }

    return { success: true, data: monthlyData };
  }

  async getProfitDataForLast12Months() {
    const currentDate = new Date(new Date().setDate(1));
    currentDate.setHours(0, 0, 0, 0); // Set the time to midnight

    // Calculate the start date of 12 months ago
    const startDate = new Date(currentDate);
    startDate.setMonth(startDate.getMonth() - 11);

    const endDate = new Date(currentDate);

    const monthlyData: { [key: string]: unknown }[] = [];

    while (startDate <= endDate) {
      const monthName = startDate.toLocaleDateString('en-US', {
        month: 'short',
      });

      const betAmount = await this.databaseService.bet.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lt: new Date(
              new Date(startDate).setMonth(startDate.getMonth() + 1),
            ),
          },
        },
        _sum: {
          amount: true,
        },
      });

      const winAmount = await this.databaseService.win.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lt: new Date(
              new Date(startDate).setMonth(startDate.getMonth() + 1, 0),
            ),
          },
        },
        _sum: {
          winAmount: true,
        },
      });

      const profit =
        Number(betAmount._sum.amount) - Number(winAmount._sum.winAmount);

      monthlyData.push({ month: monthName, profit });
      startDate.setMonth(startDate.getMonth() + 1);
    }

    return { success: true, data: monthlyData };
  }

  async recentActivities() {
    const recentBets = await this.databaseService.bet.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      take: 5,
    });

    const recentWins = await this.databaseService.win.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        bet: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      take: 5,
    });

    const bets = recentBets.map((bet) => ({
      id: bet.id,
      userid: bet.userId,
      username: bet.user.username,
      amount: bet.amount,
      createdAt: bet.createdAt,
    }));
    const wins = recentWins.map((win) => ({
      id: win.id,
      userid: win.bet.userId,
      username: win.bet.user.username,
      amount: win.winAmount,
      createdAt: win.createdAt,
    }));

    return { success: true, data: { bets, wins } };
  }
}
