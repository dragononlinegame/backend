import { IsNotEmpty, IsOptional } from 'class-validator';

export class EventDTO {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  description: string;
}
