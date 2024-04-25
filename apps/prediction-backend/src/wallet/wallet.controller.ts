import {
  Controller,
  Get,
  Post,
  Request,
  Query,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
  UnauthorizedException,
  Put,
  Response,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from '../auth/auth.guard';
import { response, roles, status } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

@UseGuards(AuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Post('recharge')
  topUpwallet(@Request() req, @Body() body) {
    return this.walletService.rechargeWalletByUserId(
      req.user.id,
      body.amount,
      body.utr,
    );
  }

  @Post('withdraw')
  async initiateWithdrawal(@Request() req, @Body() body) {
    const user = await this.databaseService.user.findFirst({
      where: {
        id: req.user.id,
      },
    });

    if (!(await bcrypt.compare(body.password, user.password))) {
      throw new UnauthorizedException('invalid credentials');
    }

    return this.walletService.initiateWithdrawalRequest(
      req.user.id,
      body.amount,
    );
  }

  @Post('bank-detail')
  async createBankDetail(@Request() req, @Body() body) {
    return this.walletService.addBankDetail(
      req.user.id,
      body.beneficiaryName,
      body.accountNumber,
      body.bankName,
      body.branchIfscCode,
    );
  }

  @Get()
  wallet(@Request() req) {
    return this.walletService.getWalletByUserId(req.user.id);
  }

  @Get('bank-detail')
  bank(@Request() req) {
    return this.walletService.getBankDetail(req.user.id);
  }

  @Get('transactions')
  transactions(
    @Request() req,
    @Query('type') type: string | undefined = undefined,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    return this.walletService.findTransactionsByUserId(
      req.user.id,
      type,
      limit,
      skip,
    );
  }

  @Get('deposits')
  deposits(
    @Request() req,
    @Query('src') src: string | undefined = undefined,
    @Query('status') status: string | undefined = undefined,
    @Query('from') from: string | undefined = undefined,
    @Query('to') to: string | undefined = undefined,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    if (req.user.role !== 'Admin') {
      return this.walletService.findDepositsByUserId(req.user.id, limit, skip);
    } else {
      console.log(from, to);
      return this.walletService.findDeposits(
        src,
        status,
        from,
        to,
        limit,
        skip,
      );
    }
  }

  @Get('withdrawals')
  withdrawals(
    @Request() req,
    @Query('src') src: string | undefined = undefined,
    @Query('status') status: string | undefined = undefined,
    @Query('from') from: string | undefined = undefined,
    @Query('to') to: string | undefined = undefined,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    if (req.user.role !== 'Admin') {
      return this.walletService.findWithdrawalsByUserId(
        req.user.id,
        limit,
        skip,
      );
    } else {
      console.log(from, to);
      return this.walletService.findWithdrawals(
        src,
        status,
        from,
        to,
        limit,
        skip,
      );
    }
  }

  @Put('deposits/:id')
  async updateDeposit(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { action: 'approve' | 'reject' },
  ) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();

    try {
      const deposit = await this.databaseService.deposit.findFirst({
        where: {
          id: id,
        },
        select: {
          id: true,
          status: true,
          wallet: true,
          amount: true,
        },
      });

      if (!deposit) {
        return { status: 'false', message: 'Deposit not found.' };
      }

      if (deposit.status === 'Pending') {
        const total_deposits = await this.databaseService.deposit.count({
          where: {
            walletId: deposit.wallet.id,
            status: 'Completed',
          },
        });

        const updated_deposit = await this.databaseService.deposit.update({
          where: {
            id: deposit.id,
          },
          data: {
            status: body.action === 'approve' ? 'Completed' : 'Failed',
            method: 'UPI',
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
        });

        if (body.action === 'approve') {
          const BonusModifier =
            total_deposits < 1
              ? parseFloat(process.env.SPONSOR_INCOME)
              : parseFloat(process.env.SPONSOR_INCOME) * 0.1;
          const DepositBonus = Number(deposit.amount) * BonusModifier;

          await this.databaseService.wallet.update({
            where: {
              id: deposit.wallet.id,
            },
            data: {
              balance: {
                increment: Number(deposit.amount) + DepositBonus,
              },
              locked: {
                increment: Number(deposit.amount) * 0.5,
              },
              transactions: {
                create: {
                  amount: deposit.amount,
                  type: 'Credit',
                  description: 'TopUp',
                },
              },
            },
          });

          const upline = await this.databaseService.teamConfig.findFirst({
            where: {
              userId: deposit.wallet.userId,
              level: 1,
            },
          });

          if (upline) {
            await this.databaseService.wallet.update({
              where: {
                userId: upline.uplineId,
              },
              data: {
                balance: {
                  increment: DepositBonus,
                },
                transactions: {
                  create: {
                    amount: DepositBonus,
                    type: 'Credit',
                    description: 'Sponsor Income',
                  },
                },
              },
            });

            await this.databaseService.commission.create({
              data: {
                amount: DepositBonus,
                fromId: deposit.wallet.userId,
                toId: upline.uplineId,
                level: 1,
                isPaid: true,
                type: 'SponsorIncome',
              },
            });
          }
        }

        return { success: 'true', message: 'success', data: updated_deposit };
      } else {
        return {
          status: 'false',
          message: 'Only pending deposits can be updated.',
        };
      }
    } catch (e) {
      console.log(e);
      throw new Error('seomthing went wrong');
    }
  }

  @Put('withdrawals/:id')
  async updateWithdrawal(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { action: 'stage' | 'unstage' | 'approve' | 'reject' },
  ) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();

    const getStatus: { [key: string]: status } = {
      stage: 'Staged',
      unstage: 'Pending',
      approve: 'Completed',
      reject: 'Failed',
    };

    if (body.action === 'reject') {
      const withdrawal = await this.databaseService.withdrawal.findFirst({
        where: {
          id: id,
        },
      });

      await this.databaseService.wallet.update({
        where: {
          id: withdrawal.walletId,
        },
        data: {
          balance: {
            increment: withdrawal.amount,
          },
          transactions: {
            create: {
              amount: withdrawal.amount,
              type: 'Credit',
              description: 'Withdrawal Rejected',
            },
          },
        },
      });
    }

    const updated_withdrawal = await this.databaseService.withdrawal.update({
      where: {
        id: id,
      },
      data: {
        status: getStatus[body.action],
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
    });

    return { success: true, message: 'success', data: updated_withdrawal };
  }

  @Post('payout')
  async payoutCashWithdrawals(@Request() req) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();

    await this.databaseService.withdrawal.updateMany({
      where: {
        status: 'Staged',
      },
      data: {
        status: 'Completed',
      },
    });

    return { success: true, message: 'success' };
  }

  @Get('payout')
  async getPayouts(@Request() req, @Response() response) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();

    const withdrawals = await this.databaseService.withdrawal.findMany({
      where: {
        status: 'Staged',
      },
      select: {
        id: true,
        amount: true,
        bankDetail: true,
      },
    });

    const payouts = withdrawals.map((withdrawal) => ({
      id: withdrawal.id,
      amount: withdrawal.amount,
      beneficiaryName: withdrawal.bankDetail['beneficiaryName'],
      accountNumber: withdrawal.bankDetail['accountNumber'],
      bankName: withdrawal.bankDetail['bankName'],
      branchIfscCode: withdrawal.bankDetail['branchIfscCode'],
    }));

    const headerRow = Object.keys(payouts[0]).join(',') + '\n';
    const csvRows = payouts.map((row) => Object.values(row).join(',') + '\n');
    const csvData = headerRow + csvRows.join('');

    response.setHeader('Content-Type', 'text/csv');
    response.setHeader('Content-Disposition', 'attachment; filename=data.csv');
    response.status(200).send(csvData);
  }

  @Post('make-txn')
  async makeWalletTransaction(@Request() req, @Body() body) {
    if ([roles.Admin, roles.Franchise].includes(req.user.role)) {
      if (req.user.role === roles.Franchise) {
        const user = await this.databaseService.user.findFirst({
          where: {
            id: body.userid,
          },
          select: {
            franchiseCode: true,
          },
        });

        if (user.franchiseCode !== req.user.franchiseCode) {
          throw new UnauthorizedException();
        }
      }

      return this.walletService.makeTransaction(
        body.userid,
        body.amount,
        body.action,
        body.note,
      );
    }

    throw new UnauthorizedException();
  }
}
