import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { nanoid } from 'nanoid';
import { PaymentGatewayService } from '../paymentGateway/paymentGateway.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly databaseService: DatabaseService,
    // private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

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
    const txnId = nanoid(12);

    // const user = await this.databaseService.user.findFirst({
    //   where: {
    //     id: userid,
    //   },
    //   select: {
    //     phone: true,
    //   },
    // });

    // return this.paymentGatewayService.initiateUpiOpenIntent(
    //   amount,
    //   user.phone,
    //   '',
    // );

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
        deposits: {
          create: {
            reference: txnId,
            amount: amount,
            method: 'UPI',
          },
        },
      },
    });

    if (parseFloat(process.env.SPONSOR_INCOME) > 0) {
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
    }

    return {
      success: true,
      data: 'success',
    };
  }

  async initiateWithdrawalRequest(userid: number, amount: number) {
    await this.databaseService.$transaction(async (txn) => {
      const wallet = await txn.wallet.update({
        where: {
          userId: userid,
        },
        data: {
          balance: {
            decrement: amount,
          },
          transactions: {
            create: {
              amount: amount,
              type: 'Debit',
              description: 'Withdrawal',
            },
          },
          withdrawals: {
            create: {
              reference: nanoid(12),
              amount: amount,
              method: 'UPI',
            },
          },
        },
      });

      if (Number(wallet.balance) < 0)
        throw new HttpException('Insufficient Balance', HttpStatus.BAD_REQUEST);
    });

    return { success: true, data: 'success' };
  }

  async findTransactionsByUserId(
    userid: number,
    type: undefined | string,
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
        description: type,
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

  async findDepositsByUserId(
    userid: number,
    limit: string = '10',
    skip: string = '0',
  ) {
    const wallet = await this.databaseService.wallet.findFirst({
      where: {
        userId: userid,
      },
    });

    const deposits = await this.databaseService.deposit.findMany({
      where: {
        walletId: wallet.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(skip),
    });

    const total = await this.databaseService.deposit.count({
      where: {
        walletId: wallet.id,
      },
    });

    return { success: true, data: { deposits, total } };
  }

  async findWithdrawalsByUserId(
    userid: number,
    limit: string = '10',
    skip: string = '0',
  ) {
    const wallet = await this.databaseService.wallet.findFirst({
      where: {
        userId: userid,
      },
    });

    const withdrawals = await this.databaseService.withdrawal.findMany({
      where: {
        walletId: wallet.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(skip),
    });

    const total = await this.databaseService.withdrawal.count({
      where: {
        walletId: wallet.id,
      },
    });

    return { success: true, data: { withdrawals, total } };
  }

  async findDeposits(
    from: string | undefined,
    to: string | undefined,
    limit: string = '10',
    skip: string = '0',
  ) {
    const deposits = await this.databaseService.deposit.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        createdAt: {
          gte: from ? new Date(new Date(from).setHours(0, 0, 0)) : undefined,
          lte: to ? new Date(new Date(to).setHours(23, 59, 59)) : undefined,
        },
      },
      include: {
        wallet: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      take: parseInt(limit),
      skip: parseInt(skip),
    });

    const total = await this.databaseService.deposit.count({
      where: {
        createdAt: {
          gte: from ? new Date(new Date(from).setHours(0, 0, 0)) : undefined,
          lte: to ? new Date(new Date(to).setHours(23, 59, 59)) : undefined,
        },
      },
    });

    return { success: true, data: { deposits, total } };
  }

  async findWithdrawals(
    from: string | undefined,
    to: string | undefined,
    limit: string = '10',
    skip: string = '0',
  ) {
    const withdrawals = await this.databaseService.withdrawal.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        createdAt: {
          gte: from ? new Date(new Date(from).setHours(0, 0, 0)) : undefined,
          lte: to ? new Date(new Date(to).setHours(23, 59, 59)) : undefined,
        },
      },
      include: {
        wallet: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      take: parseInt(limit),
      skip: parseInt(skip),
    });

    const total = await this.databaseService.withdrawal.count({
      where: {
        createdAt: {
          gte: from ? new Date(new Date(from).setHours(0, 0, 0)) : undefined,
          lte: to ? new Date(new Date(to).setHours(23, 59, 59)) : undefined,
        },
      },
    });

    return { success: true, data: { withdrawals, total } };
  }
}
