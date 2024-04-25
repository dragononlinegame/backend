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
import { FranchiseService } from './franchise.service';
import { Prisma, roles } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';

@UseGuards(AuthGuard)
@Controller('franchises')
export class FranchiseController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly franchiseService: FranchiseService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  @Post()
  async create(@Request() req, @Body() body) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    const hashedPassword = await this.hashPassword(body.password);
    return this.franchiseService.create(
      body.phone,
      hashedPassword,
      body.credits,
    );
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
    return this.franchiseService.findAll(limit, skip, filterBy, filterValue);
  }

  @Get('profile')
  async profile(@Request() req) {
    return this.franchiseService.findOneById(req.user.id);
  }

  @Patch('profile')
  updateProfile(
    @Request() req,
    @Body() userUpdateInput: Prisma.userUpdateInput,
  ) {
    return this.franchiseService.update(req.user.id, {
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

    return this.franchiseService.update(req.user.id, {
      password: hashedPassword,
    });
  }

  @Get(':id')
  findOneById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.franchiseService.findOneById(id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserInput: Prisma.userUpdateInput,
  ) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.franchiseService.update(id, updateUserInput);
  }

  @Patch(':id/balance')
  updateBalance(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body,
  ) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.franchiseService.updateBalance(id, body.type, body.amount);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();
    return this.franchiseService.remove(id);
  }
}
