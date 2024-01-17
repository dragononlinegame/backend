import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
  UnauthorizedException,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from '../auth/auth.guard';
import { NotificationDTO } from './dto/notification.dto';
import { EventDTO } from './dto/event.dto';
import { Prisma } from '@prisma/client';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('/notifications')
  notifications(@Query('isActive') isActive: string = undefined) {
    return this.activityService.getNotifications(isActive);
  }

  @Get('/events')
  events(@Query('isActive') isActive: string = undefined) {
    return this.activityService.getEvents(isActive);
  }

  @UseGuards(AuthGuard)
  @Post('/notifications')
  createNotification(@Request() req, @Body() body: NotificationDTO) {
    if (req.user.role !== 'Admin') throw new UnauthorizedException();

    return this.activityService.createNotification({
      name: body.name,
      description: body.description,
    });
  }

  @UseGuards(AuthGuard)
  @Post('/events')
  createEvent(@Request() req, @Body() body: EventDTO) {
    if (req.user.role !== 'Admin') throw new UnauthorizedException();

    return this.activityService.createEvent({
      name: body.name,
      image_url: body.image_url,
      description: body.description,
    });
  }

  @UseGuards(AuthGuard)
  @Patch('/notifications/:id')
  updateNotification(
    @Request() req,
    @Param('id', ParseIntPipe) id,
    @Body() body: Prisma.notificationUpdateInput,
  ) {
    if (req.user.role !== 'Admin') throw new UnauthorizedException();

    return this.activityService.updateNotification(id, body);
  }

  @UseGuards(AuthGuard)
  @Patch('/events/:id')
  updateEvent(
    @Request() req,
    @Param('id', ParseIntPipe) id,
    @Body() body: Prisma.eventUpdateInput,
  ) {
    if (req.user.role !== 'Admin') throw new UnauthorizedException();

    return this.activityService.updateEvent(id, body);
  }

  @UseGuards(AuthGuard)
  @Delete('/notifications/:id')
  deleteNotification(@Request() req, @Param('id', ParseIntPipe) id) {
    if (req.user.role !== 'Admin') throw new UnauthorizedException();

    return this.activityService.deleteNotification(id);
  }

  @UseGuards(AuthGuard)
  @Delete('/events/:id')
  deleteEvent(@Request() req, @Param('id', ParseIntPipe) id) {
    if (req.user.role !== 'Admin') throw new UnauthorizedException();

    return this.activityService.deleteEvent(id);
  }
}
