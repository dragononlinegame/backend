import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { UpdateGameDto } from './dto/update-game.dto';
import { AuthGuard } from '../auth/auth.guard';
import { roles } from '@prisma/client';
import { PreResultDto } from './dto/pre-result.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  findAll(
    @Query('type') type: string = undefined,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    return this.gamesService.findAll(type, limit, skip);
  }

  @Get('current')
  findCurrent(@Query('type') type: string = '0') {
    return this.gamesService.findCurrent(type);
  }

  @UseGuards(AuthGuard)
  @Get('wins')
  findWins(
    @Request() req,
    @Query('type') type: string = undefined,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.gamesService.findWins(type, limit, skip);
  }

  @UseGuards(AuthGuard)
  @Get('preresults')
  getPredefinedResults(@Request() req) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.gamesService.getPredefinedResults();
  }

  @UseGuards(AuthGuard)
  @Post('preresults')
  createPredefinedResult(@Request() req, @Body() body: PreResultDto) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.gamesService.predefineResult(
      parseInt(body.type),
      body.serial,
      body.result,
    );
  }

  @UseGuards(AuthGuard)
  @Delete('preresults/:id')
  removeResult(@Request() req, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.gamesService.deleteResult(id);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.gamesService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Get(':id/wins')
  findWinsByGameId(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
  ) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.gamesService.findWinsByGameId(id, limit, skip);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.gamesService.update(id, updateGameDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.gamesService.remove(id);
  }
}
