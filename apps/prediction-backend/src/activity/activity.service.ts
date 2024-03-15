import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ActivityService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createNotification(notificationData: Prisma.notificationCreateInput) {
    const notification = await this.databaseService.notification.create({
      data: notificationData,
    });

    return { success: true, data: notification };
  }

  async updateNotification(
    id: number,
    notificationData: Prisma.notificationUpdateInput,
  ) {
    const notification = await this.databaseService.notification.update({
      where: {
        id,
      },
      data: notificationData,
    });

    return { success: true, data: notification };
  }

  async deleteNotification(id: number) {
    await this.databaseService.notification.delete({
      where: {
        id,
      },
    });

    return { success: true, data: 'success' };
  }

  async createEvent(eventData: Prisma.eventCreateInput) {
    const event = await this.databaseService.event.create({
      data: eventData,
    });

    return { success: true, data: event };
  }

  async updateEvent(id: number, eventData: Prisma.eventUpdateInput) {
    const notification = await this.databaseService.event.update({
      where: {
        id,
      },
      data: eventData,
    });

    return { success: true, data: notification };
  }

  async deleteEvent(id: number) {
    await this.databaseService.event.delete({
      where: {
        id,
      },
    });

    return { success: true, data: 'success' };
  }

  async getNotifications(isActive: string) {
    const parsedStatus = isActive ? JSON.parse(isActive) : undefined;

    const notifications = await this.databaseService.notification.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        isActive: parsedStatus,
      },
    });

    return { success: true, data: notifications };
  }

  async getEvent(id: number) {
    const event = await this.databaseService.event.findFirst({
      where: {
        id,
      },
    });

    return { success: true, data: event };
  }

  async getEvents(isActive: string, isFeatured: string) {
    const parsedStatus = isActive ? JSON.parse(isActive) : undefined;
    const parsedFeatured = isFeatured ? JSON.parse(isActive) : undefined;

    const events = await this.databaseService.event.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        isActive: parsedStatus,
        featured: parsedFeatured,
      },
    });

    return { success: true, data: events };
  }
}
