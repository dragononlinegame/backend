import {
  Controller,
  Get,
  Post,
  Request,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  wallet(@Request() req) {
    return this.walletService.getWalletByUserId(req.user.id);
  }

  @Get('transactions')
  transactions(
    @Request() req,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    return this.walletService.findTransactionsByUserId(
      req.user.id,
      limit,
      skip,
    );
  }

  @Post('recharge')
  topUpwallet(@Request() req, @Body() body) {
    return this.walletService.rechargeWalletByUserId(req.user.id, body.amount);
  }
}
