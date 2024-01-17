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
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('recharge')
  topUpwallet(@Request() req, @Body() body) {
    return this.walletService.rechargeWalletByUserId(req.user.id, body.amount);
  }

  @Post('withdraw')
  initiateWithdrawal(@Request() req, @Body() body) {
    return this.walletService.initiateWithdrawalRequest(
      req.user.id,
      body.amount,
    );
  }

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

  @Get('deposits')
  deposits(
    @Request() req,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    return this.walletService.findDepositsByUserId(req.user.id, limit, skip);
  }

  @Get('withdrawals')
  withdrawals(
    @Request() req,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    return this.walletService.findWithdrawalsByUserId(req.user.id, limit, skip);
  }
}
