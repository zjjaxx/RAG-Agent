import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { CreateDocumentDto } from './create-document.dto.js';

/** 更新时可改元数据；传 content 时同步写正文并 version+1 */
export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @ApiPropertyOptional({ description: '正文（传入则更新并递增版本）' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;
}
