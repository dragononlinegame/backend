import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesModule } from './games/games.module';
import { AuthModule } from './auth/auth.module';
import { BetsModule } from './bets/bets.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from './database/database.module';
import { WalletModule } from './wallet/wallet.module';
import { UsersModule } from './users/users.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CronModule } from './cron/cron.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ActivityService } from './activity/activity.service';
import { ActivityController } from './activity/activity.controller';
import { TeamModule } from './team/team.module';
import { PaymentGatewayModule } from './paymentGateway/paymentGateway.module';
import { SettingsModule } from './settings/settings.module';
import { SupportModule } from './support/support.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { StorageModule } from './storage/storage.module';
import { FranchiseModule } from './franchise/franchise.module';
import { ConnectionModule } from './connections/connection.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'build'),
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.RADIS_HOST,
        port: parseInt(process.env.RADIS_PORT as string),
        // password: process.env.RADIS_PASS,
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    CronModule,
    SettingsModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    ConnectionModule,
    FranchiseModule,
    WalletModule,
    GamesModule,
    BetsModule,
    AnalyticsModule,
    TeamModule,
    PaymentGatewayModule,
    SupportModule,
    StorageModule,
  ],
  controllers: [AppController, ActivityController],
  providers: [
    AppService,
    ActivityService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
