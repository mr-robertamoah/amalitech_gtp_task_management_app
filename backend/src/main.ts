import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

dotenv.config();

console.log(process.env.JWT_SECRET);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.ALLOWED_ORIGIN?.split(',') || [],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
