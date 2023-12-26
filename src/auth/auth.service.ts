import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { charset, Charset, generate } from 'referral-codes';
import { DatabaseService } from 'src/database/database.service';
import { UserRegisteredEvent } from './events/userRegisteredEvent';
import { EventEmitter2 } from '@nestjs/event-emitter';

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

  async signin(email: string, password: string) {
    const { data: user } = await this.usersService.findOneByEmail(email);

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      success: true,
      data: {
        access_token: await this.jwtService.signAsync(payload),
      },
    };
  }

  async register(
    email: string,
    password: string,
    username: string,
    referral: string,
  ) {
    const hashedPassword = await this.hashPassword(password);

    const ref_code = generate({
      pattern: '####',
      charset: charset(Charset.ALPHANUMERIC),
      prefix: '',
      postfix: '',
      count: 1,
    })[0];

    const { data: user } = await this.usersService.create({
      email: email,
      password: hashedPassword,
      username: username ?? '',
      referralCode: ref_code,
    });

    const referrer = await this.databaseService.user.findUnique({
      where: {
        referralCode: referral ?? '0000',
      },
    });

    // Process Winnings asynchronusly
    const userRegisteredEvent = new UserRegisteredEvent();
    userRegisteredEvent.userId = user.id;
    userRegisteredEvent.referrerId = referrer.id;
    this.eventEmitter.emit('user.registered', userRegisteredEvent);

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      success: true,
      data: {
        access_token: await this.jwtService.signAsync(payload),
      },
    };
  }
}
