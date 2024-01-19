import {
  Controller,
  Get,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('/activity')
  recentActivities(@Request() req) {
    if (req.user.role !== 'Admin') throw new UnauthorizedException();
    return this.analyticsService.recentActivities();
  }

  @Get('/users')
  getUserData(@Request() req) {
    if (req.user.role !== 'Admin') throw new UnauthorizedException();
    return this.analyticsService.getUserDataForLast12Months();
  }

  @Get('/earnings')
  getProfitData(@Request() req) {
    if (req.user.role !== 'Admin') throw new UnauthorizedException();
    return this.analyticsService.getProfitDataForLast12Months();
  }

  @Get('/profits')
  getProfits(
    @Request() req,
    @Query('from') from: string | undefined = undefined,
    @Query('to') to: string | undefined = undefined,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    if (req.user.role !== 'Admin') throw new UnauthorizedException();
    return this.analyticsService.getProfits(from, to, limit, skip);
  }

  @Get('/transactions')
  getWithdrawalsData(@Request() req) {
    if (req.user.role !== 'Admin') throw new UnauthorizedException();
    return this.analyticsService.getTransactionDataForLast2Months();
  }
}
