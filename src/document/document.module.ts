import { Module } from '@nestjs/common';
import { DocumentService } from './document.service.js';
import { DocumentController } from './document.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from './entities/document.entity.js';
import { ContentEntity } from './entities/content.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity, ContentEntity])],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
