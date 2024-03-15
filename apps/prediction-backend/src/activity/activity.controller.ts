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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from '../auth/auth.guard';
import { NotificationDTO } from './dto/notification.dto';
import { EventDTO } from './dto/event.dto';
import { Prisma } from '@prisma/client';
import { StorageService } from '../storage/storage.service';
import * as multer from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('activity')
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly storageService: StorageService,
  ) {}

  @Get('/notifications')
  notifications(@Query('isActive') isActive: string = undefined) {
    return this.activityService.getNotifications(isActive);
  }

  @Get('/events')
  events(
    @Query('isActive') isActive: string = undefined,
    @Query('isFeatured') isFeatured: string = undefined,
  ) {
    return this.activityService.getEvents(isActive, isFeatured);
  }

  @Get('/events/:id')
  event(@Param('id', ParseIntPipe) id: number) {
    return this.activityService.getEvent(id);
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
  @UseInterceptors(FileInterceptor('image'))
  async createEvent(
    @Request() req,
    @UploadedFile() image: Express.Multer.File,
    @Body() body: EventDTO,
  ) {
    if (req.user.role !== 'Admin') throw new UnauthorizedException();

    try {
      const images_url = await this.storageService.upload(
        image.originalname,
        image.buffer,
      );

      return this.activityService.createEvent({
        name: body.name,
        image_url: images_url,
        description: body.description,
      });
    } catch (error) {
      return { error: 'Failed to upload file', details: error.message };
    }
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
