import type { ControllerResponse, ServerResponse } from '~/types/common'
import { BaseController } from '~/core/BaseController'
import { StockMovementsService } from '../services/index.service'
import type {
  TStockMovementListData,
  TStockMovementListQuery
} from '../types/index.type'

class StockMovementsController extends BaseController<StockMovementsService> {
  constructor() {
    super(new StockMovementsService())
  }

  public async getMovements(
    query?: TStockMovementListQuery
  ): Promise<ControllerResponse<TStockMovementListData>> {
    const response: ServerResponse<TStockMovementListData>
      = await this.service.getMovements(query)
    return this.handleResponse(response)
  }
}

export const stockMovementsController = new StockMovementsController()
