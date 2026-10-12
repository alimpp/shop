import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { AdminAuth } from '../common/decorators/admin-auth.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { QueryPaymentsDto } from './dto/query-payments.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PaymentsService } from './payments.service';

type AuthenticatedRequest = Request & {
  user: { sub: string; role?: string };
};

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findMine(
    @Query() query: QueryPaymentsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.findAllForUser(req.user.sub, query);
  }

  @AdminAuth('payments', 'view')
  @Get('admin')
  findAll(@Query() query: QueryPaymentsDto) {
    return this.paymentsService.findAllForAdmin(query);
  }

  @AdminAuth('payments', 'view')
  @Get('admin/:id')
  findOneAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOneForAdmin(id);
  }

  @AdminAuth('payments', 'edit')
  @Patch('admin/:id/status')
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.paymentsService.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.findOneForUser(req.user.sub, id);
  }
}
