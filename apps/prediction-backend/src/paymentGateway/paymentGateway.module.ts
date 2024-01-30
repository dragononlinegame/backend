import { Module } from '@nestjs/common';
import { PaymentGatewayService } from './paymentGateway.service';
import { HttpModule } from '@nestjs/axios';
import { PaymentController } from './paymentGateway.controller';

@Module({
  imports: [HttpModule],
  providers: [PaymentGatewayService],
  controllers: [PaymentController],
})
export class PaymentGatewayModule {}
