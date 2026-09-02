import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { initSentry } from './common/monitoring/sentry';

function translateValidationMessage(message: string): string {
  return message
    .replace(/must be a URL address/g, 'باید یک URL معتبر باشد')
    .replace(/must be a UUID/g, 'باید یک شناسه معتبر (UUID) باشد')
    .replace(/should not be empty/g, 'نباید خالی باشد');
}

async function bootstrap() {
  initSentry();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors
          .flatMap((error) =>
            error.constraints ? Object.values(error.constraints) : [],
          )
          .map((message) => translateValidationMessage(message));

        return new BadRequestException(
          messages.length
            ? messages.join('، ')
            : 'اطلاعات ارسال‌شده نامعتبر است',
        );
      },
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on http://0.0.0.0:${port}`);
}
bootstrap();
