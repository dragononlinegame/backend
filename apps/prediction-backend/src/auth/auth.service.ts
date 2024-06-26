import {
  BadRequestException,
  Injectable,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { charset, Charset, generate } from 'referral-codes';
import { DatabaseService } from '../database/database.service';
import { UserRegisteredEvent } from './events/userRegisteredEvent';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { roles } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly databaseService: DatabaseService,
    private readonly usersService: UsersService,
    private eventEmitter: EventEmitter2,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async signin(phone: string, password: string, @Res() response: Response) {
    const { data: user } = await this.usersService.findOneByPhone(phone);

    if (!(await this.comparePasswords(password, user.password))) {
      throw new UnauthorizedException('invalid credentials');
    }

    const payload = {
      role: 'user',
      sub: user.id,
      phone: user.phone,
      username: user.username,
    };

    const access_token = await this.jwtService.signAsync(payload);

    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return response.json({
      success: true,
      data: {
        access_token,
      },
    });
  }

  async signinWithAdministrativeRole(
    type: string,
    id: string,
    password: string,
    @Res() response: Response,
  ) {
    const franchise = await this.databaseService.franchise.findFirst({
      where: {
        OR: [
          {
            phone: id,
          },
          {
            franchiseId: id,
          },
        ],
        role: type as roles,
      },
    });

    if (
      !franchise ||
      !(await this.comparePasswords(password, franchise.password))
    ) {
      throw new UnauthorizedException('invalid credentials');
    }

    const payload = {
      role: 'franchise',
      sub: franchise.id,
      id: franchise.franchiseId,
    };

    const access_token = await this.jwtService.signAsync(payload);

    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return response.json({
      success: true,
      data: {
        access_token,
      },
    });
  }

  async register(
    phone: string,
    password: string,
    username: string,
    referral: string,
  ) {
    const hashedPassword = await this.hashPassword(password);

    const franchise = await this.databaseService.franchise.findUnique({
      where: {
        franchiseCode: referral.split('_')[0].toLowerCase(),
      },
    });

    const referrer = await this.databaseService.user.findUnique({
      where: {
        referralCode: referral.split('_')[1],
      },
    });

    if (!referrer && referral.split('_')[1] !== '0000') {
      throw new BadRequestException('Invalid Referral Code');
    }

    const ref_code = generate({
      pattern: '######',
      charset: charset(Charset.ALPHANUMERIC),
      prefix: '',
      postfix: '',
      count: 1,
    })[0];

    const { data: user } = await this.usersService.create({
      phone: phone,
      password: hashedPassword,
      username: username ?? '',
      referralCode: ref_code,
      franchise: {
        connect: {
          franchiseCode: franchise.franchiseCode,
        },
      },
    });

    if (referrer) {
      const userRegisteredEvent = new UserRegisteredEvent();
      userRegisteredEvent.userId = user.id;
      userRegisteredEvent.referrerId = referrer.id;
      this.eventEmitter.emit('user.registered', userRegisteredEvent);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      success: true,
      data: {
        access_token,
      },
    };
  }
}
