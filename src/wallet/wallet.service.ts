import { Injectable } from '@nestjs/common';
import { prisma } from 'lib/prisma';

@Injectable()
export class WalletService {
  async rechargeWalletByUserId(userid: number, amount: number) {
    await prisma.wallet.update({
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
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId: userid,
      },
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        walletId: wallet.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(skip),
    });

    const total = await prisma.transaction.count({
      where: {
        walletId: wallet.id,
      },
    });

    return { success: true, data: { transactions, total } };
  }
}
