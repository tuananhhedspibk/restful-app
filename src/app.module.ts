import { Module } from '@nestjs/common';
import { UserModule } from './users/user.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [UserModule, HealthModule],
})
export class AppModule {}
