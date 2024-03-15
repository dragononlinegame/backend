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
import { AuthGuard } from '../auth/auth.guard';
import * as bcrypt from 'bcrypt';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  @Get()
  findAll(
    @Request() req,
    @Query('limit') limit: string = '10',
    @Query('skip') skip: string = '0',
    @Query('filterBy') filterBy = undefined,
    @Query('filterValue') filterValue = undefined,
  ) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.usersService.findAll(limit, skip, filterBy, filterValue);
  }

  @Get('profile')
  profile(@Request() req) {
    return this.usersService.findOneById(req.user.id);
  }

  @Patch('profile')
  updateProfile(
    @Request() req,
    @Body() userUpdateInput: Prisma.userUpdateInput,
  ) {
    return this.usersService.update(req.user.id, {
      username: userUpdateInput.username,
      email: userUpdateInput.email,
    });
  }

  @Patch('profile/pwd')
  async changePassword(
    @Request() req,
    @Body() userUpdateInput: Prisma.userUpdateInput,
  ) {
    const hashedPassword = await this.hashPassword(
      userUpdateInput.password as string,
    );

    return this.usersService.update(req.user.id, {
      password: hashedPassword,
    });
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
