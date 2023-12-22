import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('/v1/api');
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
