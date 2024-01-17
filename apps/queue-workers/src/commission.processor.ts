import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { DatabaseService } from './database/database.service';

@Processor('commission-processing')
export class CommissionProcessor {
  constructor(private readonly databaseService: DatabaseService) {}

  @Process('processCommission')
  async handleProcessCommission(
    job: Job<{
      to: number;
      amount: number;
    }>,
  ) {
    const commission = job.data;

    try {
      const update_wallet = this.databaseService.wallet.update({
        where: {
          userId: commission.to,
        },
        data: {
          balance: {
            increment: commission.amount,
          },
          transactions: {
            create: {
              amount: commission.amount,
              type: 'Credit',
              description: 'Level Income',
            },
          },
        },
      });

      const update_commissions = this.databaseService.commission.updateMany({
        where: {
          toId: commission.to,
          isPaid: false,
        },
        data: {
          isPaid: true,
        },
      });

      await this.databaseService.$transaction([
        update_wallet,
        update_commissions,
      ]);
    } catch (error) {
      throw error;
    }
  }
}
