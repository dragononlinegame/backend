import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { ResultAnnouncedListener } from './listeners/result-announced.listener';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'bet-processing'
    })
  ],
  controllers: [GamesController],
  providers: [GamesService, ResultAnnouncedListener],
})
export class GamesModule {}
