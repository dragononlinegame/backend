import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronJobService } from './cron.service';
import { GamesService } from '../games/games.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  providers: [GamesService, CronJobService],
})
export class CronModule {}
