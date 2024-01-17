import { NestFactory } from '@nestjs/core';
import { QueueWorkersModule } from './queue-workers.module';

async function bootstrap() {
  const app = await NestFactory.create(QueueWorkersModule);
  await app.listen(process.env.QUEUE_PORT || 3001);
}
bootstrap();
