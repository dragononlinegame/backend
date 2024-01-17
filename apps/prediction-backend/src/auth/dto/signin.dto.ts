import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class SignInDto {
  @IsPhoneNumber('IN')
  phone: string;

  @IsNotEmpty()
  password: string;
}
