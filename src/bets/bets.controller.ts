import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  UnauthorizedException,
  Query,
  Post,
  Body,
} from '@nestjs/common';
import { BetsService } from './bets.service';
import { roles } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateBetDto } from './dto/create-bet.dto';

@UseGuards(AuthGuard)
@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  create(@Request() req, @Body() createBetDto: CreateBetDto) {
    return this.betsService.create(req.user.id, createBetDto);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('type') type: string = '0',
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    if (req.user.role !== roles.Admin) {
      return this.betsService.findByUserId(req.user.id, type, limit, skip);
    } else {
      return this.betsService.findAll(type, limit, skip);
    }
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.betsService.findOne(id);
  }
}
