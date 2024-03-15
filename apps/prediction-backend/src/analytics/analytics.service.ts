import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { profit_type } from '@prisma/client';

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

  async getTransactionDataForLast2Months() {
    const currentDate = new Date(new Date().setDate(1));
    currentDate.setHours(0, 0, 0, 0); // Set the time to midnight

    // Calculate the start date of 2 months ago
    const startDate = new Date(currentDate);
    startDate.setMonth(startDate.getMonth() - 1);

    const endDate = new Date(currentDate);

    const monthlyData: { [key: string]: unknown }[] = [];

    while (startDate <= endDate) {
      const monthName = startDate.toLocaleDateString('en-US', {
        month: 'short',
      });

      const withdrawal = await this.databaseService.withdrawal.aggregate({
        where: {
          status: 'Completed',
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

      const deposit = await this.databaseService.deposit.aggregate({
        where: {
          status: 'Completed',
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

      monthlyData.push({
        month: monthName,
        withdrawal: Number(withdrawal._sum.amount),
        deposit: Number(deposit._sum.amount),
      });
      startDate.setMonth(startDate.getMonth() + 1);
    }

    return { success: true, data: monthlyData };
  }

  async getDeposits() {
    const today = new Date();
    today.setHours(0, 0, 0);

    const totalDepositToday = await this.databaseService.deposit.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'Completed',
        createdAt: {
          gt: today,
        },
      },
    });

    today.setDate(new Date().getDate() - 7);
    const totalDepositThisWeek = await this.databaseService.deposit.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'Completed',
        createdAt: {
          gt: today,
        },
      },
    });

    today.setDate(new Date().getDate() - 30);
    const totalDepositThisMonth = await this.databaseService.deposit.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'Completed',
        createdAt: {
          gt: today,
        },
      },
    });

    today.setDate(new Date().getDate() - 360);
    const totalDepositThisYear = await this.databaseService.deposit.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'Completed',
        createdAt: {
          gt: today,
        },
      },
    });

    return {
      success: true,
      data: {
        totalDepositToday: Number(totalDepositToday._sum.amount),
        totalDepositThisWeek: Number(totalDepositThisWeek._sum.amount),
        totalDepositThisMonth: Number(totalDepositThisMonth._sum.amount),
        totalDepositThisYear: Number(totalDepositThisYear._sum.amount),
      },
    };
  }

  async getWithdrawals() {
    const today = new Date();
    today.setHours(0, 0, 0);

    const totalWithdrawalToday =
      await this.databaseService.withdrawal.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: 'Completed',
          createdAt: {
            gt: today,
          },
        },
      });

    today.setDate(new Date().getDate() - 7);
    const totalWithdrawalThisWeek =
      await this.databaseService.withdrawal.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: 'Completed',
          createdAt: {
            gt: today,
          },
        },
      });

    today.setDate(new Date().getDate() - 30);
    const totalWithdrawalThisMonth =
      await this.databaseService.withdrawal.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: 'Completed',
          createdAt: {
            gt: today,
          },
        },
      });

    today.setDate(new Date().getDate() - 360);
    const totalWithdrawalThisYear =
      await this.databaseService.withdrawal.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          status: 'Completed',
          createdAt: {
            gt: today,
          },
        },
      });

    return {
      success: true,
      data: {
        totalWithdrawalToday: Number(totalWithdrawalToday._sum.amount),
        totalWithdrawalThisWeek: Number(totalWithdrawalThisWeek._sum.amount),
        totalWithdrawalThisMonth: Number(totalWithdrawalThisMonth._sum.amount),
        totalWithdrawalThisYear: Number(totalWithdrawalThisYear._sum.amount),
      },
    };
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

  async getProfits(
    from: string | undefined,
    to: string | undefined,
    limit: string = '10',
    skip: string = '0',
    type: string = 'Daily',
  ) {
    const profits = await this.databaseService.profit.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        createdAt: {
          gte: from ? new Date(new Date(from).setHours(0, 0, 0)) : undefined,
          lte: to ? new Date(new Date(to).setHours(23, 59, 59)) : undefined,
        },
        type: type as profit_type,
      },
      take: parseInt(limit),
      skip: parseInt(skip),
    });

    const total = await this.databaseService.profit.count({
      where: {
        createdAt: {
          gte: from ? new Date(new Date(from).setHours(0, 0, 0)) : undefined,
          lte: to ? new Date(new Date(to).setHours(23, 59, 59)) : undefined,
        },
        type: 'Daily',
      },
    });

    return { success: true, data: { profits, total } };
  }

  async getTopPlayers(limit: number) {
    const topWinners = await this.databaseService.wallet.findMany({
      orderBy: {
        totalWin: 'desc',
      },
      select: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        totalBet: true,
        totalWin: true,
      },
      take: limit,
    });

    const topBeters = await this.databaseService.wallet.findMany({
      orderBy: {
        totalBet: 'desc',
      },
      select: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        totalBet: true,
        totalWin: true,
      },
      take: limit,
    });

    return {
      success: true,
      data: {
        topWinners,
        topBeters,
      },
    };
  }
}
