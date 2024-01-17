import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DatabaseModule } from './database/database.module';
import { BetProcessor } from './bet.processor';
import { CommissionProcessor } from './commission.processor';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.RADIS_HOST,
        port: parseInt(process.env.RADIS_PORT as string),
        password: process.env.RADIS_PASS,
      },
    }),
    BullModule.registerQueue({
      name: 'bet-processing',
    }),
    BullModule.registerQueue({
      name: 'commission-processing',
    }),
    DatabaseModule,
  ],
  providers: [BetProcessor, CommissionProcessor]
})
export class QueueWorkersModule {}
