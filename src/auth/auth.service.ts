import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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

  async register(email: string, password: string, username: string) {
    const hashedPassword = await this.hashPassword(password);

    const { data: user } = await this.usersService.create({
      email: email,
      password: hashedPassword,
      username: username ?? '',
    });

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
