import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SnowflakeService } from '../common/transformers/snowflake.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { QueryDocumentDto } from './dto/query-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { ContentEntity } from './entities/content.entity.js';
import {
  DocumentEntity,
  DocumentStatus,
} from './entities/document.entity.js';

export interface DocumentListResult {
  items: DocumentEntity[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepo: Repository<DocumentEntity>,
    @InjectRepository(ContentEntity)
    private readonly contentRepo: Repository<ContentEntity>,
    private readonly snowflake: SnowflakeService,
  ) {}

  /** 创建文档 + 正文（共享雪花主键） */
  async create(dto: CreateDocumentDto): Promise<DocumentEntity> {
    const id = this.snowflake.nextId();
    const status = dto.status ?? DocumentStatus.Draft;
    const wordCount = this.countWords(dto.content);

    const document = this.documentRepo.create({
      id,
      title: dto.title,
      summary: dto.summary ?? null,
      categoryId: dto.categoryId ?? null,
      teamId: dto.teamId ?? null,
      authorId: dto.authorId ?? null,
      coverImage: dto.coverImage ?? null,
      tags: dto.tags ?? null,
      status,
      remark: dto.remark ?? null,
      isPublic: dto.isPublic ?? false,
      wordCount,
      publishTime: status === DocumentStatus.Published ? new Date() : null,
      content: this.contentRepo.create({
        id,
        content: dto.content,
        version: 1,
      }),
    });

    return this.documentRepo.save(document);
  }

  /** 列表：不 join 正文，避免大字段拖慢查询 */
  async findAll(query: QueryDocumentDto): Promise<DocumentListResult> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const qb = this.documentRepo
      .createQueryBuilder('doc')
      .orderBy('doc.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (query.keyword?.trim()) {
      qb.andWhere('doc.title ILIKE :keyword', {
        keyword: `%${query.keyword.trim()}%`,
      });
    }
    if (query.status !== undefined) {
      qb.andWhere('doc.status = :status', { status: query.status });
    }
    if (query.categoryId) {
      qb.andWhere('doc.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.teamId) {
      qb.andWhere('doc.teamId = :teamId', { teamId: query.teamId });
    }
    if (query.authorId) {
      qb.andWhere('doc.authorId = :authorId', { authorId: query.authorId });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  /** 详情：带正文 */
  async findOne(id: string): Promise<DocumentEntity> {
    const document = await this.documentRepo.findOne({
      where: { id },
      relations: { content: true },
    });
    if (!document) {
      throw new NotFoundException(`文档不存在: ${id}`);
    }
    return document;
  }

  /** 更新元数据；若传 content 则同步正文并 version+1 */
  async update(id: string, dto: UpdateDocumentDto): Promise<DocumentEntity> {
    const document = await this.findOne(id);
    const { content: body, ...meta } = dto;

    if (meta.title !== undefined) document.title = meta.title;
    if (meta.summary !== undefined) document.summary = meta.summary ?? null;
    if (meta.categoryId !== undefined)
      document.categoryId = meta.categoryId ?? null;
    if (meta.teamId !== undefined) document.teamId = meta.teamId ?? null;
    if (meta.authorId !== undefined) document.authorId = meta.authorId ?? null;
    if (meta.coverImage !== undefined)
      document.coverImage = meta.coverImage ?? null;
    if (meta.tags !== undefined) document.tags = meta.tags ?? null;
    if (meta.remark !== undefined) document.remark = meta.remark ?? null;
    if (meta.isPublic !== undefined) document.isPublic = meta.isPublic;

    if (meta.status !== undefined) {
      const prev = document.status;
      document.status = meta.status;
      if (
        meta.status === DocumentStatus.Published &&
        prev !== DocumentStatus.Published &&
        !document.publishTime
      ) {
        document.publishTime = new Date();
      }
    }

    if (body !== undefined) {
      if (!document.content) {
        document.content = this.contentRepo.create({
          id,
          content: body,
          version: 1,
        });
      } else {
        document.content.content = body;
        document.content.version += 1;
      }
      document.wordCount = this.countWords(body);
    }

    return this.documentRepo.save(document);
  }

  /** 软删除文档及正文 */
  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);
    if (document.content) {
      await this.contentRepo.softRemove(document.content);
    }
    await this.documentRepo.softRemove(document);
  }

  /** 字数：按字符计（去空白） */
  private countWords(text: string): number {
    return text.replace(/\s+/g, '').length;
  }
}
