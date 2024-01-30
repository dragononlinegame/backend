import { Body, Controller, Post, Request } from '@nestjs/common';
import { PaymentGatewayService } from './paymentGateway.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  @Post('webhook')
  async handleWebhook(@Request() req, @Body() body) {
    console.log(body);
    return { status: 'true', message: 'success' };
  }

  @Post('upi')
  async initiateUpiIntent(
    @Request() req,
    @Body() body: { amount: number; mobileNumber: string; targetApp: string },
  ) {
    const resp = this.paymentGatewayService.initiateUpiOpenIntent(
      body.amount,
      body.mobileNumber,
      body.targetApp,
    );

    console.log(resp);

    return resp;
  }
}
