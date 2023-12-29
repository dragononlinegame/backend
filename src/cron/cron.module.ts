import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronJobService } from './cron.service';
import { GamesService } from 'src/games/games.service';
import { BullModule } from '@nestjs/bull';
import { CommissionProcessor } from './commission.processor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'commission-processing',
    }),
  ],
  providers: [GamesService, CronJobService, CommissionProcessor],
})
export class CronModule {}
