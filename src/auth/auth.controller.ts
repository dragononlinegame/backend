import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { Response } from 'express';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  signIn(@Body() signInDto: SignInDto, @Res() response: Response) {
    return this.authService.signin(
      signInDto.email,
      signInDto.password,
      response,
    );
  }

  @Post('signout')
  @UseGuards(AuthGuard)
  async logout(@Res() response: Response) {
    // Clear the access token cookie
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return response.json({ success: true, message: 'you are now Logged out.' });
  }

  @Post('register')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.register(
      signUpDto.email,
      signUpDto.password,
      signUpDto.username,
      signUpDto.referral,
    );
  }
}
