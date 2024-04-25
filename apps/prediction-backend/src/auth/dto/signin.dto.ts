import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class SignInDto {
  @IsPhoneNumber('IN')
  phone: string;

  @IsNotEmpty()
  password: string;
}

export class SignInWithAdministrativeRoleDto {
  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  password: string;
}
