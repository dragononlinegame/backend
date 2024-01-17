import { IsNotEmpty, IsOptional } from 'class-validator';

export class EventDTO {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  image_url: string;

  @IsOptional()
  @IsNotEmpty()
  description: string;
}
