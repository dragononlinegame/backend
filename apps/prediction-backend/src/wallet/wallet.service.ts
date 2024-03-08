import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { nanoid } from 'nanoid';
import { PaymentGatewayService } from '../paymentGateway/paymentGateway.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class WalletService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly paymentGatewayService: PaymentGatewayService,
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

  async rechargeWalletByUserId(
    userid: number,
    amount: number,
    utr: string | undefined,
  ) {
    const txnId = nanoid(12);

    // Validate Amount HERE:
    // Like MIN, MAX, isNaN, etc

    const user = await this.databaseService.user.findFirst({
      where: {
        id: userid,
      },
      select: {
        phone: true,
        wallet: true,
      },
    });

    try {
      const deposit = await this.databaseService.deposit.create({
        data: {
          walletId: user.wallet.id,
          amount: amount,
          method: 'UPI',
          reference: utr ?? txnId,
          status: 'Pending',
        },
      });

      // const requestBody = this.paymentGatewayService.constructRequestBody(
      //   userid,
      //   txnId,
      //   amount,
      //   user.phone,
      // );
      // const base64encodedBody = this.paymentGatewayService.encodeRequestBody(
      //   JSON.stringify(requestBody),
      // );
      // const checksum =
      //   this.paymentGatewayService.generateChecksum(base64encodedBody);

      return {
        success: true,
        message: 'deposit request initiated.',
        data: {
          ref: deposit.reference,
        },
        // data: {
        //   base64encodedBody,
        //   checksum,
        // },
      };
    } catch (e) {
      if (
        e instanceof PrismaClientKnownRequestError &&
        e.meta?.target[0] === 'reference'
      ) {
        return {
          success: false,
          message: 'Deposit with this UTR is already requested.',
        };
      } else {
        return {
          success: false,
          message: 'Something went wrong',
        };
      }
    }
  }

  async initiateWithdrawalRequest(userid: number, amount: number) {
    const wallet = await this.getWalletByUserId(userid);

    try {
      const bankDetail = await this.databaseService.bankDetail.findFirstOrThrow(
        {
          where: {
            walletId: wallet.data.id,
          },
        },
      );

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
                status: 'Pending',
                bankDetail: {
                  beneficiaryName: bankDetail.beneficiaryName,
                  accountNumber: bankDetail.accountNumber,
                  bankName: bankDetail.bankName,
                  branchIfscCode: bankDetail.branchIfscCode,
                },
              },
            },
          },
        });

        if (Number(wallet.balance) < 0)
          // throw new HttpException(
          //   'Insufficient Balance',
          //   HttpStatus.BAD_REQUEST,
          // );

          return { success: false, message: 'Insufficient Balance' };
      });

      return { success: true, data: 'success' };
    } catch (e) {
      return { success: false, message: 'Please Add Your Bank Details' };
    }
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
    src: string | undefined,
    status: string | undefined,
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
        reference: { contains: src },
        status: status
          ? status === 'All'
            ? undefined
            : (status as 'Pending' | 'Completed')
          : undefined,
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

  async addBankDetail(
    userid: number,
    beneficiaryName: string,
    accountNumber: string,
    bankName: string,
    branchIfscCode: string,
  ) {
    const wallet = await this.getWalletByUserId(userid);

    const bankDetail = await this.databaseService.bankDetail.upsert({
      where: {
        walletId: wallet.data.id,
      },
      create: {
        walletId: wallet.data.id,
        beneficiaryName,
        accountNumber,
        bankName,
        branchIfscCode,
      },
      update: {
        beneficiaryName,
        accountNumber,
        bankName,
        branchIfscCode,
      },
    });

    return { success: true, data: bankDetail };
  }

  async getBankDetail(userid: number) {
    const wallet = await this.getWalletByUserId(userid);

    const bankDetail = await this.databaseService.bankDetail.findFirst({
      where: {
        walletId: wallet.data.id,
      },
    });

    return { success: true, data: bankDetail };
  }

  async makeTransaction(
    userid: number,
    amount: number,
    action: 'Debit' | 'Credit',
    note: string,
  ) {
    const wallet = await this.databaseService.wallet.update({
      where: {
        userId: userid,
      },
      data: {
        balance: {
          increment: action === 'Credit' ? amount : amount * -1,
        },
        transactions: {
          create: {
            amount: amount,
            type: action,
            status: 'Completed',
            description: note || 'made by admin',
          },
        },
      },
    });

    return { success: true, data: wallet };
  }
}
