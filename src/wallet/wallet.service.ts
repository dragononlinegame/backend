import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class WalletService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getWalletByUserId(id: number) {
    const wallet = await this.databaseService.wallet.findFirst({
      where: {
        userId: id,
      },
      select: {
        id: true,
        balance: true,
      },
    });

    return { success: true, data: wallet };
  }

  async rechargeWalletByUserId(userid: number, amount: number) {
    await this.databaseService.wallet.update({
      where: {
        userId: userid,
      },
      data: {
        balance: {
          increment: amount,
        },
        transactions: {
          create: {
            amount: amount,
            type: 'Credit',
            description: 'TopUp',
          },
        },
      },
    });

    const upline = await this.databaseService.teamConfig.findFirst({
      where: {
        userId: userid,
        level: 1,
      },
    });

    if (upline) {
      const bonus_amount = amount * parseFloat(process.env.SPONSOR_INCOME);

      await this.databaseService.wallet.update({
        where: {
          userId: upline.uplineId,
        },
        data: {
          balance: {
            increment: bonus_amount,
          },
          transactions: {
            create: {
              amount: bonus_amount,
              type: 'Credit',
              description: 'Sponsor Income',
            },
          },
        },
      });
    }

    return {
      success: true,
      data: 'success',
    };
  }

  async findTransactionsByUserId(
    userid: number,
    limit: string = '10',
    skip: string = '0',
  ) {
    const wallet = await this.databaseService.wallet.findFirst({
      where: {
        userId: userid,
      },
    });

    const transactions = await this.databaseService.transaction.findMany({
      where: {
        walletId: wallet.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(skip),
    });

    const total = await this.databaseService.transaction.count({
      where: {
        walletId: wallet.id,
      },
    });

    return { success: true, data: { transactions, total } };
  }
}
