import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class PaymentGatewayService {
  readonly BASE_URL = `https://api.phonepe.com/apis/hermes`;
  readonly apiEndpoint = `/pg/v1/pay`;
  readonly webhookUrl = `https://info.dragononlinegame.com/v1/api/payments/webhook`;
  readonly targetApps = {
    PhonePe: 'com.phonepe.app',
    Paytm: 'net.one97.paytm',
    GPAY: 'com.google.android.apps.walletnfcrel',
  };

  readonly merchantId = process.env.PHONEPE_MERCHANT_ID;
  readonly saltkey = process.env.PHONEPE_API_KEY;
  readonly saltIndex = process.env.PHONEPE_KEY_INDEX;

  constructor(private readonly httpService: HttpService) {
    this.validateEnvironmentVariables();
  }

  private validateEnvironmentVariables() {
    const requiredVariables = [
      'PHONEPE_MERCHANT_ID',
      'PHONEPE_API_KEY',
      'PHONEPE_KEY_INDEX',
    ];

    for (const variable of requiredVariables) {
      if (!process.env[variable]) {
        throw new Error(`Missing required environment variable: ${variable}`);
      }
    }
  }

  constructRequestBody(
    userid: number,
    txnId: string,
    amount: number,
    mobileNumber: string,
  ) {
    const amountInPaisa = amount * 100;

    return {
      merchantId: this.merchantId,
      merchantTransactionId: txnId,
      merchantUserId: userid,
      amount: amountInPaisa,
      callbackUrl: this.webhookUrl,
      mobileNumber: mobileNumber,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };
  }

  encodeRequestBody(body: string) {
    return Buffer.from(body).toString('base64');
  }

  generateChecksum(base64encodedReqBody: string) {
    const sha256 = createHash('sha256')
      .update(base64encodedReqBody + this.apiEndpoint + this.saltkey)
      .digest('hex');

    return sha256 + '###' + this.saltIndex;
  }
}
