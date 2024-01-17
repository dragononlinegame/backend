import { Injectable } from '@nestjs/common';
import { sub } from 'date-fns';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TeamService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(userid: number, level: string, limit: string, skip: string) {
    const parsedLevel = level ? parseInt(level) : undefined;
    const parsedLimit = parseInt(limit);
    const parsedSkip = parseInt(skip);

    const members = await this.databaseService.teamConfig.findMany({
      where: {
        uplineId: userid,
        level: parsedLevel,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            status: true,
            createdAt: true,
          },
        },
      },
      take: parsedLimit,
      skip: parsedSkip,
    });

    const total = await this.databaseService.teamConfig.count({
      where: {
        uplineId: userid,
        level: parsedLevel,
      },
    });

    return {
      success: true,
      data: {
        members: members.map((member) => ({
          ...member.user,
          level: member.level,
        })),
        total,
      },
    };
  }

  async findOne(userid: number, id: number) {
    const memeber = await this.databaseService.teamConfig.findFirst({
      where: {
        uplineId: userid,
        userId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    const bets = await this.databaseService.bet.aggregate({
      where: {
        userId: id,
      },
      _sum: {
        amount: true,
      },
    });

    return { success: true, data: { ...memeber, turnover: bets._sum.amount } };
  }

  async findCommissions(userid: number) {
    const today = new Date(new Date().setHours(0, 0, 0));

    const total = await this.databaseService.commission.aggregate({
      where: {
        toId: userid,
        isPaid: true,
        createAt: {
          lt: today,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const week = await this.databaseService.commission.aggregate({
      where: {
        toId: userid,
        isPaid: true,
        createAt: {
          gt: sub(today, { weeks: 1 }),
          lt: today,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const yesterday_team = await this.databaseService.commission.aggregate({
      where: {
        level: { not: 1 },
        toId: userid,
        isPaid: true,
        createAt: {
          gt: sub(today, { days: 1 }),
          lt: today,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const yesterday_direct = await this.databaseService.commission.aggregate({
      where: {
        level: 1,
        toId: userid,
        isPaid: true,
        createAt: {
          gt: sub(today, { days: 1 }),
          lt: today,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return {
      success: true,
      data: {
        total: Number(total._sum.amount),
        week: Number(week._sum.amount),
        yesterday_team: Number(yesterday_team._sum.amount),
        yesterday_direct: Number(yesterday_direct._sum.amount),
      },
    };
  }
}
