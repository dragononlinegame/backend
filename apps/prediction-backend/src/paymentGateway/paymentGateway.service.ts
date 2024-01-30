import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { createHash } from 'crypto';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class PaymentGatewayService {
  readonly BASE_URL = `https://api.phonepe.com/apis/hermes`;
  readonly apiEndpoint = `/pg/v1/pay`;
  readonly webhookUrl = `https://info.dragononlinegame.com/payments/webhook`;
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

  constructRequestBody(amount: number, mobileNumber: string, upiApp: string) {
    //   paymentInstrument: {
    //     type: 'UPI_INTENT',
    //     targetApp: this.targetApps[upiApp] ?? this.targetApps['PhonePe'],
    //   },

    return {
      merchantId: this.merchantId,
      merchantTransactionId: nanoid(),
      amount: amount,
      callbackUrl: this.webhookUrl,
      mobileNumber: mobileNumber,
      deviceContext: {
        deviceOS: 'ANDROID',
      },
      paymentInstrument: {
        type: 'UPI_QR',
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

  async initiateUpiOpenIntent(
    amount: number,
    mobileNumber: string,
    upiApp: string,
  ) {
    const reqBody = this.constructRequestBody(amount, mobileNumber, upiApp);
    const base64encodedReqBody = this.encodeRequestBody(
      JSON.stringify(reqBody),
    );
    const checksum = this.generateChecksum(base64encodedReqBody);

    const { data } = await firstValueFrom(
      this.httpService
        .post<{
          success: boolean;
          code: string;
          message: string;
          data?: { [key: string]: unknown };
        }>(
          `${this.BASE_URL}${this.apiEndpoint}`,
          {
            request: base64encodedReqBody,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-VERIFY': checksum,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error);
            throw new InternalServerErrorException();
          }),
        ),
    );

    return data;
  }
}
