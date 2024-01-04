import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  findAll(
    @Request() req,
    @Query('level') level: string = undefined,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    return this.teamService.findAll(req.user.id, level, limit, skip);
  }

  @Get('/commissions')
  findCommissions(@Request() req) {
    return this.teamService.findCommissions(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.teamService.findOne(req.user.id, id);
  }
}
