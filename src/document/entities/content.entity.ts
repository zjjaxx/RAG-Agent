import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { DocumentEntity } from './document.entity.js';
import { bigintTransformer } from '../../common/transformers/bight.transformer.js';
import { BaseEntity } from '../../common/entity/base-entity.js';

/** 文档正文（与 Document 共享主键，一对一） */
@Entity('kh_document_content')
export class ContentEntity extends BaseEntity {
  /** 与 Document.id 相同 */
  @ApiProperty({ description: '与文档相同的雪花 ID' })
  @PrimaryColumn({ type: 'bigint', transformer: bigintTransformer })
  id: string;

  @OneToOne(() => DocumentEntity, (document) => document.content, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  document: Relation<DocumentEntity>;

  /** 正文 */
  @ApiProperty({ description: '正文' })
  @Column({ type: 'text' })
  content: string;

  /** 内容版本（每次更新正文 +1） */
  @ApiProperty({ description: '内容版本（每次更新正文 +1）', default: 1 })
  @Column({ type: 'int', default: 1 })
  version: number;
}
