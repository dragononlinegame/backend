import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Request,
  UseGuards,
  UnauthorizedException,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma, roles } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { WalletService } from 'src/wallet/wallet.service';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly walletService: WalletService,
  ) {}

  @Get()
  findAll(
    @Request() req,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.usersService.findAll(limit, skip);
  }

  @Get('profile')
  profile(@Request() req) {
    return this.usersService.findOneById(req.user.id);
  }

  @Get('wallet')
  wallet(@Request() req) {
    return this.usersService.getWalletByUserId(req.user.id);
  }

  @Get('wallet/transactions')
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

  @Post('wallet/recharge')
  topUpwallet(@Request() req, @Body() body) {
    return this.walletService.rechargeWalletByUserId(req.user.id, body.amount);
  }

  @Get(':id')
  findOneById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserInput: Prisma.userUpdateInput,
  ) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.usersService.update(id, updateUserInput);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.usersService.remove(id);
  }
}
