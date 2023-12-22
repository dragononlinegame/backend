import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesModule } from './games/games.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BetsModule } from './bets/bets.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WalletService } from './wallet/wallet.service';
import { WalletController } from './wallet/wallet.controller';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    GamesModule,
    AuthModule,
    BetsModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.RADIS_HOST,
        port: parseInt(process.env.RADIS_PORT as string),
        password: process.env.RADIS_PASS,
      },
    }),
  ],
  controllers: [AppController, WalletController],
  providers: [AppService, WalletService],
})
export class AppModule {}
