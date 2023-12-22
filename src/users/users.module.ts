import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { WalletService } from 'src/wallet/wallet.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, WalletService],
})
export class UsersModule {}
