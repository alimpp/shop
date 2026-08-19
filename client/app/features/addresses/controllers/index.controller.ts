import type { ControllerResponse, ServerResponse } from '~/types/common'
import { BaseController } from '~/core/BaseController'
import { AddressesDS } from '../data/index.store'
import { AddressesService } from '../services/index.service'
import type { TAddress, TAddressPayload } from '../types/index.type'

class AddressesController extends BaseController<AddressesService> {
  constructor() {
    super(new AddressesService())
  }

  private readonly addressesDS = AddressesDS.getInstance()

  public async getAddresses(): Promise<ControllerResponse<TAddress[]>> {
    this.addressesDS.setLoading(true)

    const response: ServerResponse<TAddress[]> = await this.service.getAddresses()

    if (response.success) {
      this.addressesDS.setAddresses(response.data ?? [])
    }

    this.addressesDS.setLoading(false)
    return this.handleResponse(response)
  }

  public async createAddress(
    payload: TAddressPayload
  ): Promise<ControllerResponse<TAddress>> {
    this.addressesDS.setSubmitting(true)

    const response: ServerResponse<TAddress> =
      await this.service.createAddress(payload)

    if (response.success && response.data) {
      this.addressesDS.upsertAddress(response.data)
    }

    this.addressesDS.setSubmitting(false)
    return this.handleResponse(response)
  }

  public async updateAddress(
    id: string,
    payload: TAddressPayload
  ): Promise<ControllerResponse<TAddress>> {
    this.addressesDS.setSubmitting(true)

    const response: ServerResponse<TAddress> =
      await this.service.updateAddress(id, payload)

    if (response.success && response.data) {
      this.addressesDS.upsertAddress(response.data)
      this.addressesDS.setSelectedAddress(response.data)
    }

    this.addressesDS.setSubmitting(false)
    return this.handleResponse(response)
  }

  public async deleteAddress(
    id: string
  ): Promise<ControllerResponse<{ id: string }>> {
    this.addressesDS.setSubmitting(true)

    const response: ServerResponse<{ id: string }> =
      await this.service.deleteAddress(id)

    if (response.success) {
      this.addressesDS.removeAddress(id)
    }

    this.addressesDS.setSubmitting(false)
    return this.handleResponse(response)
  }
}

export const addressesController = new AddressesController()
