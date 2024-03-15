import { IsNumberString } from 'class-validator';

export class PreResultDto {
  @IsNumberString()
  type: string;

  @IsNumberString()
  serial: string;

  result: string;
}
