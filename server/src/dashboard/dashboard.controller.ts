import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { DashboardService } from './dashboard.service';
import { QueryLowStockDto } from './dto/query-low-stock.dto';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard() {
    return await this.dashboardService.getDashboard();
  }

  @Get('low-stock')
  async getLowStock(@Query() query: QueryLowStockDto) {
    return await this.dashboardService.findLowStockProducts(query);
  }
}
