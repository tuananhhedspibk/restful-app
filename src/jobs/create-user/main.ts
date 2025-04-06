import { NestFactory } from '@nestjs/core';
import { CreateUserModule } from './create-user.module';
import { InjectionToken } from '../../users/application/injection-token';

async function bootstrap() {
  const module = await NestFactory.create(CreateUserModule);

  const job = module.get(InjectionToken.CREATE_USER_JOB);

  await job.execute();
}

bootstrap();
