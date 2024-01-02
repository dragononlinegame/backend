import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ActivityService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createNotification(notificationData: Prisma.notificationCreateInput) {
    return this.databaseService.notification.create({
      data: notificationData,
    });
  }

  async createEvent(eventData: Prisma.eventCreateInput) {
    return this.databaseService.event.create({
      data: eventData,
    });
  }

  async getNotifications(isActive: boolean = true) {
    return this.databaseService.notification.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        isActive,
      },
    });
  }

  async getEvents(isActive: boolean = true) {
    return this.databaseService.event.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        isActive,
      },
    });
  }
}
