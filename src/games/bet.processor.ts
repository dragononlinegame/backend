import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { prisma } from 'src/lib/prisma';

@Processor('bet-processing')
export class BetProcessor {
  private readonly logger = new Logger(BetProcessor.name);

  @Process('processBet')
  async handleProcessBet(
    job: Job<{
      id: number;
      amount: number;
      prediction: string;
      result: string;
      gameId: number;
      userId: number;
    }>,
  ) {
    const bet = job.data;

    try {
      this.logger.debug(`Processing Bet with ID :: ${bet.id}`);

      const prediction = bet.prediction;

      let multiplier = parseFloat(process.env.DEFAULT_MULTIPLIER as string);
      if (prediction === bet.result) {
        multiplier = parseFloat(process.env.NUMBER_MULTIPLIER as string);
      }

      const winAmount = Number(bet.amount) * multiplier;

      const update_wallet = prisma.wallet.update({
        where: {
          userId: bet.userId,
        },
        data: {
          balance: {
            increment: winAmount,
          },
          transactions: {
            create: {
              amount: winAmount,
              type: 'Credit',
              description: 'Bet Won',
            },
          },
        },
      });

      // Create a new win record
      const create_win = prisma.win.create({
        data: {
          gameId: bet.gameId,
          betId: bet.id,
          winAmount: winAmount,
          isClaimed: true,
        },
      });

      await prisma.$transaction([update_wallet, create_win]);

      this.logger.debug(`Bet ID :: ${bet.id} Processed`);
    } catch (error) {
      this.logger.debug(`Failed to process Bet ID :: ${bet.id}`);
      throw error;
    }
  }
}
