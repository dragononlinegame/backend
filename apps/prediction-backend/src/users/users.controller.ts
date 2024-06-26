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
import { DatabaseService } from '../database/database.service';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly usersService: UsersService,
  ) {}

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
    if (roles.Admin === req.user.role) {
      return this.usersService.findAll(
        undefined,
        limit,
        skip,
        filterBy,
        filterValue,
      );
    } else if (roles.Franchise === req.user.role) {
      return this.usersService.findAll(
        req.user.franchiseCode,
        limit,
        skip,
        filterBy,
        filterValue,
      );
    } else {
      throw new UnauthorizedException();
    }
  }

  @Get('profile')
  async profile(@Request() req) {
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

  @Get('findByUsername/:username')
  findOneByUsername(@Request() req, @Param('username') username: string) {
    return this.usersService.findOneByUsername(username);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserInput: Prisma.userUpdateInput,
  ) {
    if ([roles.Admin, roles.Franchise].includes(req.user.role)) {
      if (req.user.role === roles.Franchise) {
        const user = await this.usersService.findOneById(id);

        if (user.data.franchiseCode !== req.user.franchiseCode) {
          throw new UnauthorizedException();
        }
      }

      return this.usersService.update(id, updateUserInput);
    }

    throw new UnauthorizedException();
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.usersService.remove(id);
  }
}
