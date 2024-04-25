import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
  Post,
  Body,
  Put,
} from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('connections')
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post()
  create(@Request() req, @Body() body) {
    return this.connectionService.create(req.user.id, body.userId);
  }

  @Put('/request')
  updateRequest(@Request() req, @Body() body) {
    return this.connectionService.updateRequest(
      req.user.id,
      body.reqId,
      body.action,
    );
  }

  @Post('/:id/request')
  createRequest(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body,
  ) {
    return this.connectionService.createRequest(
      id,
      req.user.id,
      body.receiverId,
      body.amount,
    );
  }

  @Get()
  getConnections(@Request() req) {
    return this.connectionService.connectionByUserId(req.user.id);
  }

  @Get(':id')
  getConnectionById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.connectionService.getConnectionById(id);
  }
}
