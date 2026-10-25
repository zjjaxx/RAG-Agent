import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Snowflake } from '@sapphire/snowflake';

/** 项目自定义纪元；改 epoch 后新旧 ID 不可用同一套 deconstruct */
const EPOCH = new Date('2024-01-01T00:00:00.000Z');

/**
 * 雪花 ID（string），对接实体里的 bigint + bigintTransformer。
 * workerId / processId 范围 0–31，多实例时用环境变量区分。
 */
@Injectable()
export class SnowflakeService {
  private readonly snowflake: Snowflake;

  constructor(config: ConfigService) {
    this.snowflake = new Snowflake(EPOCH);
    this.snowflake.workerId = Number(config.get('SNOWFLAKE_WORKER_ID') ?? 0);
    this.snowflake.processId = Number(config.get('SNOWFLAKE_PROCESS_ID') ?? 0);
  }

  /** 生成下一个 ID（string，避免 JSON/Number 丢精度） */
  nextId(): string {
    return this.snowflake.generate().toString();
  }

  /** 从 ID 解析出时间戳、worker、process、序号 */
  deconstruct(id: string) {
    return this.snowflake.deconstruct(id);
  }
}
