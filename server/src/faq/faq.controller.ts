import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AdminAuth } from '../common/decorators/admin-auth.decorator';
import {
  CreateFaqDto,
  QueryFaqDto,
  UpdateFaqDto,
} from './dto/create-faq.dto';
import { FaqService } from './faq.service';

@Controller('faqs')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get('public')
  findAllPublic(@Query() query: QueryFaqDto) {
    return this.faqService.findAllPublic(query);
  }

  @AdminAuth('faqs', 'create')
  @Post()
  create(@Body() dto: CreateFaqDto) {
    return this.faqService.create(dto);
  }

  @AdminAuth('faqs', 'view')
  @Get()
  findAll(@Query() query: QueryFaqDto) {
    return this.faqService.findAll(query);
  }

  @AdminAuth('faqs', 'view')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.faqService.findOne(id);
  }

  @AdminAuth('faqs', 'edit')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFaqDto,
  ) {
    return this.faqService.update(id, dto);
  }

  @AdminAuth('faqs', 'delete')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.faqService.remove(id);
  }
}
