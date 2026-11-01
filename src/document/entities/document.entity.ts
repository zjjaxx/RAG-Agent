import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  OneToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { bigintTransformer } from '../../common/transformers/bight.transformer.js';
import { BaseEntity } from '../../common/entity/base-entity.js';
import { ContentEntity } from './content.entity.js';

/** 文档状态 */
export enum DocumentStatus {
  /** 草稿 */
  Draft = 0,
  /** 已发布 */
  Published = 1,
  /** 已归档：不会作为知识被检索 */
  Archived = 2,
}

/** 文档元数据（PostgreSQL kh_document） */
@Entity('kh_document')
export class DocumentEntity extends BaseEntity {
  /** 雪花 ID */
  @ApiProperty({ description: '雪花 ID', example: '1234567890123456789' })
  @PrimaryColumn({ type: 'bigint', transformer: bigintTransformer })
  id: string;

  /** 标题 */
  @ApiProperty({ description: '标题' })
  @Column({ type: 'varchar' })
  title: string;

  /** 正文（共享主键一对一；列表查询勿默认 join） */
  @ApiPropertyOptional({ type: () => ContentEntity, description: '正文（详情接口才返回）' })
  @OneToOne(() => ContentEntity, (content) => content.document, {
    cascade: true,
  })
  content?: Relation<ContentEntity>;

  /** 摘要（列表展示用） */
  @ApiPropertyOptional({ description: '摘要', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  summary?: string | null;

  /** 分类 ID */
  @ApiPropertyOptional({ description: '分类 ID', nullable: true })
  @Column({
    name: 'category_id',
    type: 'bigint',
    nullable: true,
    transformer: bigintTransformer,
  })
  categoryId?: string | null;

  /** 团队 ID */
  @ApiPropertyOptional({ description: '团队 ID', nullable: true })
  @Column({
    name: 'team_id',
    type: 'bigint',
    nullable: true,
    transformer: bigintTransformer,
  })
  teamId?: string | null;

  /** 作者 ID */
  @ApiPropertyOptional({ description: '作者 ID', nullable: true })
  @Column({
    name: 'author_id',
    type: 'bigint',
    nullable: true,
    transformer: bigintTransformer,
  })
  authorId?: string | null;

  /** 封面图 URL */
  @ApiPropertyOptional({ description: '封面图 URL', nullable: true })
  @Column({ name: 'cover_image', type: 'varchar', nullable: true })
  coverImage?: string | null;

  /** 标签 */
  @ApiPropertyOptional({ description: '标签', type: [String], nullable: true })
  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[] | null;

  /** 状态：0 草稿 / 1 已发布 / 2 已归档 */
  @ApiProperty({
    description: '状态：0 草稿 / 1 已发布 / 2 已归档',
    enum: DocumentStatus,
  })
  @Column({ type: 'smallint', default: DocumentStatus.Draft })
  status: DocumentStatus;

  /** 备注 */
  @ApiPropertyOptional({ description: '备注', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  remark?: string | null;

  /** 浏览数 */
  @ApiProperty({ description: '浏览数', default: 0 })
  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  /** 点赞数 */
  @ApiProperty({ description: '点赞数', default: 0 })
  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  /** 评论数 */
  @ApiProperty({ description: '评论数', default: 0 })
  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount: number;

  /** 收藏数 */
  @ApiProperty({ description: '收藏数', default: 0 })
  @Column({ name: 'favourite_count', type: 'int', default: 0 })
  favouriteCount: number;

  /** 字数（写正文时同步更新） */
  @ApiProperty({ description: '字数', default: 0 })
  @Column({ name: 'word_count', type: 'int', default: 0 })
  wordCount: number;

  /** 发布时间 */
  @ApiPropertyOptional({ description: '发布时间', nullable: true })
  @Column({ name: 'publish_time', type: 'timestamp', nullable: true })
  publishTime?: Date | null;

  /** 是否公开 */
  @ApiProperty({ description: '是否公开', default: false })
  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic: boolean;

  /** 创建人 ID */
  @ApiPropertyOptional({ description: '创建人 ID', nullable: true })
  @Column({
    name: 'create_by',
    type: 'bigint',
    nullable: true,
    transformer: bigintTransformer,
  })
  createBy?: string | null;

  /** 更新人 ID */
  @ApiPropertyOptional({ description: '更新人 ID', nullable: true })
  @Column({
    name: 'update_by',
    type: 'bigint',
    nullable: true,
    transformer: bigintTransformer,
  })
  updateBy?: string | null;
}
