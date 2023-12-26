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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma, roles } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
