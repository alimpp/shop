import type { ControllerResponse, ServerResponse } from '~/types/common'
import { BaseController } from '~/core/BaseController'
import { PaymentsService } from '../services/index.service'
import type {
  TPaymentListData,
  TPaymentListQuery,
  TPaymentTransaction,
  TUpdatePaymentStatusPayload
} from '../types/index.type'

class PaymentsController extends BaseController<PaymentsService> {
  constructor() {
    super(new PaymentsService())
  }

  public async getMyPayments(
    query?: TPaymentListQuery
  ): Promise<ControllerResponse<TPaymentListData>> {
    const response: ServerResponse<TPaymentListData>
      = await this.service.getMyPayments(query)
    return this.handleResponse(response)
  }

  public async getMyPayment(
    id: string
  ): Promise<ControllerResponse<TPaymentTransaction>> {
    const response = await this.service.getMyPayment(id)
    return this.handleResponse(response)
  }

  public async getAdminPayments(
    query?: TPaymentListQuery
  ): Promise<ControllerResponse<TPaymentListData>> {
    const response = await this.service.getAdminPayments(query)
    return this.handleResponse(response)
  }

  public async getAdminPayment(
    id: string
  ): Promise<ControllerResponse<TPaymentTransaction>> {
    const response = await this.service.getAdminPayment(id)
    return this.handleResponse(response)
  }

  public async updateAdminPaymentStatus(
    id: string,
    payload: TUpdatePaymentStatusPayload
  ): Promise<ControllerResponse<TPaymentTransaction>> {
    const response = await this.service.updateAdminPaymentStatus(id, payload)
    return this.handleResponse(response)
  }
}

export const paymentsController = new PaymentsController()
