import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { DocumentService } from './document.service.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { DocumentListDto } from './dto/document-list.dto.js';
import { QueryDocumentDto } from './dto/query-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { DocumentEntity } from './entities/document.entity.js';

@ApiTags('document')
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @ApiOperation({ summary: '创建文档（含正文）' })
  @ApiCreatedResponse({ type: DocumentEntity, description: '创建成功' })
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询文档列表（不含正文）' })
  @ApiOkResponse({ type: DocumentListDto, description: '列表结果' })
  findAll(@Query() query: QueryDocumentDto) {
    return this.documentService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文档详情（含正文）' })
  @ApiParam({ name: 'id', description: '文档雪花 ID' })
  @ApiOkResponse({ type: DocumentEntity })
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新文档；传 content 时同步正文并 version+1' })
  @ApiParam({ name: 'id', description: '文档雪花 ID' })
  @ApiOkResponse({ type: DocumentEntity })
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '软删除文档（及正文）' })
  @ApiParam({ name: 'id', description: '文档雪花 ID' })
  @ApiNoContentResponse({ description: '删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.documentService.remove(id);
  }
}
