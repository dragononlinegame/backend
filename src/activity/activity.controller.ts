import { Controller, Get, Query } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('/notifications')
  notifications(@Query('isActive') isActive: boolean = true) {
    return this.activityService.getNotifications(isActive);
  }

  @Get('/events')
  events(@Query('isActive') isActive: boolean = true) {
    return this.activityService.getEvents(isActive);
  }
}
