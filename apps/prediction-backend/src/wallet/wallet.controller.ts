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
    @Query('type') type: string | undefined = undefined,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    return this.walletService.findTransactionsByUserId(
      req.user.id,
      type,
      limit,
      skip,
    );
  }

  @Get('deposits')
  deposits(
    @Request() req,
    @Query('from') from: string | undefined = undefined,
    @Query('to') to: string | undefined = undefined,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    if (req.user.role !== 'Admin') {
      return this.walletService.findDepositsByUserId(req.user.id, limit, skip);
    } else {
      console.log(from, to);
      return this.walletService.findDeposits(from, to, limit, skip);
    }
  }

  @Get('withdrawals')
  withdrawals(
    @Request() req,
    @Query('from') from: string | undefined = undefined,
    @Query('to') to: string | undefined = undefined,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    if (req.user.role !== 'Admin') {
      return this.walletService.findWithdrawalsByUserId(
        req.user.id,
        limit,
        skip,
      );
    } else {
      console.log(from, to);
      return this.walletService.findWithdrawals(from, to, limit, skip);
    }
  }
}
