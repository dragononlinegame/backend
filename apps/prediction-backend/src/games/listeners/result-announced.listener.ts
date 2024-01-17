import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ResultAnnouncedEvent } from '../events/resultAnnouncedEvent';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Numbers } from '../../constants/numbers';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ResultAnnouncedListener {
  constructor(
    @InjectQueue('bet-processing') private readonly betProcessingQueue: Queue,
    private readonly databaseService: DatabaseService,
  ) {}

  private readonly Numbers = Numbers;

  @OnEvent('result.announced', { async: true })
  async handleResultAnnouncedEvent(payload: ResultAnnouncedEvent) {
    const winning_predictions: string[] = [
      payload.result,
      this.Numbers[Number(payload.result)].size,
      ...this.Numbers[Number(payload.result)].color,
    ];

    const winning_bets = await this.databaseService.bet.findMany({
      where: {
        gameId: payload.gameId,
        prediction: {
          in: winning_predictions,
        },
      },
      select: {
        id: true,
        amount: true,
        prediction: true,
        gameId: true,
        userId: true,
      },
    });

    // Send each winning bet individually into the "bet-processing" queue
    for (const winningBet of winning_bets) {
      console.log(`Added to queue:: ${winningBet.id}`);
      await this.betProcessingQueue.add(
        'processBet',
        {
          ...winningBet,
          result: payload.result,
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
      );
    }
  }
}
