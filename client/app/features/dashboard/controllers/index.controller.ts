import type { ControllerResponse, ServerResponse } from '~/types/common'
import { BaseController } from '~/core/BaseController'
import { DashboardDS } from '../data/index.store'
import { DashboardService } from '../services/index.service'
import type { TDashboardData } from '../types/index.type'

class DashboardController extends BaseController<DashboardService> {
  constructor() {
    super(new DashboardService())
  }

  private readonly dashboardDS = DashboardDS.getInstance()

  public async getDashboard(): Promise<ControllerResponse<TDashboardData>> {
    this.dashboardDS.setLoading(true)

    const response: ServerResponse<TDashboardData> =
      await this.service.getDashboard()

    if (response.success && response.data) {
      this.dashboardDS.setData(response.data)
    }

    this.dashboardDS.setLoading(false)
    return this.handleResponse(response)
  }
}

export const dashboardController = new DashboardController()
