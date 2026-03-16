import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { existsSync } from 'fs';
import { join } from 'path';
import { config as dotenvConfig } from 'dotenv';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

const envCandidates = [
  join(process.cwd(), '.env'),
  join(process.cwd(), 'apps', 'api', '.env'),
  join(process.cwd(), '..', '.env'),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    dotenvConfig({ path: envPath });
    break;
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? [
      'http://localhost:3001',
      'http://localhost:3000',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Unitic CMS API Dokumantasyonu')
    .setDescription(
      'Unitic CMS backend endpointleri, istek ve yanit semalari, yetki gereksinimleri ve ornek kullanim aciklamalari.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token degerini Bearer ile birlikte gonderin.',
      },
      'bearer',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/', app, swaggerDocument, {
    customSiteTitle: 'Unitic CMS API',
    swaggerOptions: {
      docExpansion: 'none',
      displayRequestDuration: true,
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
