import { ApiProperty } from '@nestjs/swagger';
import { DocumentEntity } from '../entities/document.entity.js';

export class DocumentListDto {
  @ApiProperty({ type: [DocumentEntity], description: '当前页数据' })
  items: DocumentEntity[];

  @ApiProperty({ description: '总条数', example: 100 })
  total: number;

  @ApiProperty({ description: '当前页', example: 1 })
  page: number;

  @ApiProperty({ description: '每页条数', example: 20 })
  pageSize: number;
}
