import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly databaseService: DatabaseService,
  ) {}

  async upsertSetting(key: string, value: string) {
    const setting = await this.databaseService.settings.upsert({
      where: {
        key: key,
      },
      create: {
        key,
        value,
      },
      update: {
        value,
      },
    });

    await this.cacheManager.set(key, setting);

    return { success: true, data: setting };
  }

  async getSettingByKey(key: string) {
    const cachedSetting = await this.cacheManager.get(key);
    if (cachedSetting) {
      return { success: true, data: cachedSetting, cachehit: true };
    }

    const setting = await this.databaseService.settings.findUnique({
      where: {
        key,
      },
    });

    if (setting) {
      await this.cacheManager.set(key, setting, 0);
      return { success: true, data: setting };
    } else {
      return { success: false, message: 'setting not found' };
    }
  }

  async getSettings() {
    const settings = await this.databaseService.settings.findMany();

    return { success: true, data: settings };
  }

  async deleteSettingByKey(key: string) {
    await this.databaseService.settings.delete({
      where: {
        key,
      },
    });

    return { success: true, message: 'Setting deleted Succesfully' };
  }
}
