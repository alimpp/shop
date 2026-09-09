import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { QueryStockMovementsDto } from './dto/query-stock-movements.dto';
import { StockMovementsService } from './stock-movements.service';

@Controller('admin/stock-movements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get()
  findAll(@Query() query: QueryStockMovementsDto) {
    return this.stockMovementsService.findAll(query);
  }
}
