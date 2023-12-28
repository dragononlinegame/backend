import { Module } from '@nestjs/common';
import { BetsService } from './bets.service';
import { BetsController } from './bets.controller';
import { BetListener } from './listeners/bet.listener';

@Module({
  controllers: [BetsController],
  providers: [BetsService, BetListener],
})
export class BetsModule {}
