import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { AdminAuth } from '../common/decorators/admin-auth.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { QueryContactMessagesDto } from './dto/query-contact-messages.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateContactMessageDto) {
    return this.contactService.create(dto);
  }

  @AdminAuth('contact', 'view')
  @Get()
  findAll(@Query() query: QueryContactMessagesDto) {
    return this.contactService.findAll(query);
  }

  @AdminAuth('contact', 'view')
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('markAsRead') markAsRead?: string,
  ) {
    const shouldMark = markAsRead !== 'false';
    return this.contactService.findOne(id, shouldMark);
  }

  @AdminAuth('contact', 'edit')
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactService.markAsRead(id);
  }

  @AdminAuth('contact', 'delete')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactService.remove(id);
  }
}
