import { IsNotEmpty } from 'class-validator';

export class NotificationDTO {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;
}
