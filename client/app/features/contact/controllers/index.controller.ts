import type { ControllerResponse, ServerResponse } from '~/types/common'
import { BaseController } from '~/core/BaseController'
import { ContactService } from '../services/index.service'
import type {
  TContactListData,
  TContactListQuery,
  TContactMessage,
  TCreateContactPayload
} from '../types/index.type'

class ContactController extends BaseController<ContactService> {
  constructor() {
    super(new ContactService())
  }

  public async createMessage(
    payload: TCreateContactPayload
  ): Promise<ControllerResponse<{ id: string; createdAt: string }>> {
    const response = await this.service.createMessage(payload)
    return this.handleResponse(response)
  }

  public async getMessages(
    query?: TContactListQuery
  ): Promise<ControllerResponse<TContactListData>> {
    const response: ServerResponse<TContactListData>
      = await this.service.getMessages(query)
    return this.handleResponse(response)
  }

  public async getMessage(
    id: string
  ): Promise<ControllerResponse<TContactMessage>> {
    const response = await this.service.getMessage(id)
    return this.handleResponse(response)
  }

  public async markAsRead(
    id: string
  ): Promise<ControllerResponse<TContactMessage>> {
    const response = await this.service.markAsRead(id)
    return this.handleResponse(response)
  }

  public async deleteMessage(
    id: string
  ): Promise<ControllerResponse<{ id: string; deleted: boolean }>> {
    const response = await this.service.deleteMessage(id)
    return this.handleResponse(response)
  }
}

export const contactController = new ContactController()
