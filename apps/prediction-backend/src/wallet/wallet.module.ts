import { Module } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service';
import { WalletController } from './wallet.controller';
import { PaymentGatewayService } from '../paymentGateway/paymentGateway.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [HttpModule],
  controllers: [WalletController],
  providers: [WalletService, PaymentGatewayService],
})
export class WalletModule {}
