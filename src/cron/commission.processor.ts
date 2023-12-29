import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { DatabaseService } from 'src/database/database.service';

@Processor('commission-processing')
export class CommissionProcessor {
  private readonly logger = new Logger(CommissionProcessor.name);

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
      this.logger.debug(
        `Processing commission with userID :: ${commission.to}`,
      );

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

      this.logger.debug(`commission with userID :: ${commission.to} Processed`);
    } catch (error) {
      this.logger.debug(
        `Failed to process commission with userID :: ${commission.to}`,
      );
      throw error;
    }
  }
}
