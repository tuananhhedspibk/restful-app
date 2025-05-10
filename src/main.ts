import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErrorInterceptor } from '@libs/interceptor/error';
import { LoggerInterceptor } from '@libs/interceptor/logger';

function setupSwagger(app: INestApplication): void {
  const documentBuilder = new DocumentBuilder()
    .setTitle('Swagger')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: { defaultModelExpandDepth: -1 },
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });
  app.useGlobalInterceptors(new ErrorInterceptor());
  app.useGlobalInterceptors(new LoggerInterceptor());

  setupSwagger(app);
  await app.listen(3000, process.env.SERVER_HOST || 'localhost');
}
bootstrap();
