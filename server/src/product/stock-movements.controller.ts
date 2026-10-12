import { Controller, Get, Query } from '@nestjs/common';
import { AdminAuth } from '../common/decorators/admin-auth.decorator';
import { QueryStockMovementsDto } from './dto/query-stock-movements.dto';
import { StockMovementsService } from './stock-movements.service';

@Controller('admin/stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @AdminAuth('stock_history', 'view')
  @Get()
  findAll(@Query() query: QueryStockMovementsDto) {
    return this.stockMovementsService.findAll(query);
  }
}
