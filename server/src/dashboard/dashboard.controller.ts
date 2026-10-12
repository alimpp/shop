import { Controller, Get, Query } from '@nestjs/common';
import { AdminAuth } from '../common/decorators/admin-auth.decorator';
import { DashboardService } from './dashboard.service';
import { QueryLowStockDto } from './dto/query-low-stock.dto';

@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @AdminAuth('dashboard', 'view')
  @Get()
  async getDashboard() {
    return await this.dashboardService.getDashboard();
  }

  @AdminAuth('stock', 'view')
  @Get('low-stock')
  async getLowStock(@Query() query: QueryLowStockDto) {
    return await this.dashboardService.findLowStockProducts(query);
  }
}
