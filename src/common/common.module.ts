import { Global, Module } from '@nestjs/common';
import { SnowflakeService } from './transformers/snowflake.js';

@Global()
@Module({
  providers: [SnowflakeService],
  exports: [SnowflakeService],
})
export class CommonModule {}
