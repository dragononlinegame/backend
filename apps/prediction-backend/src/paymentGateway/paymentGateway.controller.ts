import { Body, Controller, Post, Request } from '@nestjs/common';
import { PaymentGatewayService } from './paymentGateway.service';
import { DatabaseService } from '../database/database.service';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Post('webhook')
  async handleWebhook(@Request() req, @Body() body) {
    const paisa2rupee = (amount: number) => amount / 100;

    const encodedResponse = body.response;

    const response = Buffer.from(encodedResponse, 'base64').toString();

    try {
      const { success, data } = JSON.parse(response);

      const deposit = await this.databaseService.deposit.findFirst({
        where: {
          reference: data.merchantTransactionId,
        },
        select: {
          status: true,
          wallet: true,
        },
      });

      if (deposit && deposit.status === 'Pending') {
        await this.databaseService.deposit.update({
          where: {
            reference: data.merchantTransactionId,
          },
          data: {
            status: success ? 'Completed' : 'Failed',
            method: data.paymentInstrument.type,
          },
        });

        await this.databaseService.wallet.update({
          where: {
            id: deposit.wallet.id,
          },
          data: {
            balance: {
              increment: paisa2rupee(data.amount),
            },
            transactions: {
              create: {
                amount: paisa2rupee(data.amount),
                type: 'Credit',
                description: 'TopUp',
              },
            },
          },
        });

        if (parseFloat(process.env.SPONSOR_INCOME) > 0) {
          const upline = await this.databaseService.teamConfig.findFirst({
            where: {
              userId: deposit.wallet.userId,
              level: 1,
            },
          });

          if (upline) {
            const bonus_amount =
              paisa2rupee(data.amount) * parseFloat(process.env.SPONSOR_INCOME);

            await this.databaseService.wallet.update({
              where: {
                userId: upline.uplineId,
              },
              data: {
                balance: {
                  increment: bonus_amount,
                },
                transactions: {
                  create: {
                    amount: bonus_amount,
                    type: 'Credit',
                    description: 'Sponsor Income',
                  },
                },
              },
            });
          }
        }
      }
    } catch (e) {
      console.log(e);
    }

    return { status: 'true', message: 'success' };
  }

  // @Post('pg/pay')
  // async initiatePayment(
  //   @Request() req,
  //   @Body() body: { amount: number; mobileNumber: string; targetApp: string },
  // ) {
  //   const resp = this.paymentGatewayService.(
  //     body.amount,
  //     body.mobileNumber,
  //     body.targetApp,
  //   );

  //   console.log(resp);

  //   return resp;
  // }
}
