import { Module } from '@nestjs/common';
import { WalletService } from 'src/wallet/wallet.service';
import { WalletController } from './wallet.controller';

@Module({
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
