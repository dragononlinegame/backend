import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { DatabaseService } from './database/database.service';

@Processor('bet-processing')
export class BetProcessor {
  constructor(private readonly databaseService: DatabaseService) {}

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
    
    console.log(`processing bet id:: ${bet.id}`)

    try {
      const prediction = bet.prediction;

      let multiplier = parseFloat(process.env.DEFAULT_MULTIPLIER as string);
      if (prediction === bet.result) {
        multiplier = parseFloat(process.env.NUMBER_MULTIPLIER as string);
      }

      const winAmount = Number(bet.amount) * multiplier;

      const update_wallet = this.databaseService.wallet.update({
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
      const create_win = this.databaseService.win.create({
        data: {
          gameId: bet.gameId,
          betId: bet.id,
          winAmount: winAmount,
          isClaimed: true,
        },
      });

      await this.databaseService.$transaction([update_wallet, create_win]);

      console.log(`processed bet id:: ${bet.id}`)
    } catch (error) {
      console.log(`failed to process bet id:: ${bet.id}`)
      throw error;
    }
  }
}
