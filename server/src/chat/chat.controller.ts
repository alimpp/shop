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
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { QueryChatsDto } from './dto/query-chats.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';

type AuthenticatedRequest = Request & {
  user: { sub: string; role?: string };
};

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createChat(
    @Body() dto: CreateChatDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.chatService.createChat(dto, req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async getChatsForAdmin(
    @Query() query: QueryChatsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.chatService.getChatsForAdmin(query, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getChatsForUser(
    @Query() query: QueryChatsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.chatService.getChatsForUser(query, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  async getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryMessagesDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const isAdmin = req.user.role === 'admin';
    return await this.chatService.getMessages(id, query, req.user.sub, isAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const isAdmin = req.user.role === 'admin';
    return await this.chatService.sendMessage(id, dto, req.user.sub, isAdmin);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/messages/:messageId')
  @HttpCode(HttpStatus.OK)
  async deleteMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const isAdmin = req.user.role === 'admin';
    return await this.chatService.deleteMessage(
      id,
      messageId,
      req.user.sub,
      isAdmin,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const isAdmin = req.user.role === 'admin';
    return await this.chatService.markAsRead(id, req.user.sub, isAdmin);
  }
}
