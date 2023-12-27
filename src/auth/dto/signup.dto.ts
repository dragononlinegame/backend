import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  username: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Referral should not be empty when provided' })
  referral: string;
}
