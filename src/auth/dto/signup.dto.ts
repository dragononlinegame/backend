import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'password must be atleast 6 charcter.' })
  password: string;

  @IsNotEmpty()
  @MinLength(3, { message: 'username must be atleast 3 charcter.' })
  username: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Referral should not be empty when provided' })
  referral: string;
}
