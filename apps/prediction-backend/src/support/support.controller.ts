import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  Param,
  UnauthorizedException,
  Put,
  ParseIntPipe,
  Delete,
  Query,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { AuthGuard } from '../auth/auth.guard';
import { roles } from '@prisma/client';
import { query } from 'express';
import { stat } from 'fs';

@UseGuards(AuthGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('issues')
  raiseIssue(@Request() req, @Body() body) {
    return this.supportService.raiseAnIssue(
      req.user.id,
      body.type,
      body.amount,
      body.ref,
      body.note,
    );
  }

  @Post('issue/:id/resolve')
  resolve(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() body) {
    if (req.user.role !== roles.Admin) throw new UnauthorizedException();

    return this.supportService.resolve(id, body.status, body.response);
  }

  @Post('issue/:id/response')
  reponse(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() body) {
    return this.supportService.response(
      req.user.role,
      req.user.id,
      id,
      body.message,
    );
  }

  @Get('issue/:id')
  getIssue(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.supportService.getIssueById(req.user.role, req.user.id, id);
  }

  @Get('issues')
  getIssues(
    @Request() req,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('skip', ParseIntPipe) skip: number,
    @Query('status') status: boolean | undefined,
  ) {
    if (req.user.role === roles.Admin) {
      return this.supportService.getAllIssues(limit, skip, status);
    } else {
      return this.supportService.getIssuesByUserId(req.user.id);
    }
  }
}
