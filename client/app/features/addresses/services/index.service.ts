import type { ServerResponse } from '~/types/common'
import { BaseApp } from '~/core/BaseApp'
import type { TAddress, TAddressPayload } from '../types/index.type'

type TRawAddress = Record<string, unknown>

export class AddressesService extends BaseApp<TAddress> {
  constructor() {
    super('addresses')
  }

  private normalizeAddress(item: TRawAddress): TAddress {
    return {
      id: String(item.id ?? ''),
      userId: String(item.userId ?? ''),
      name: String(item.name ?? ''),
      province: String(item.province ?? ''),
      city: String(item.city ?? ''),
      address: String(item.address ?? ''),
      postalCode: String(item.postalCode ?? ''),
      created_at: String(item.created_at ?? ''),
      updated_at: String(item.updated_at ?? '')
    }
  }

  public async getAddresses(): Promise<ServerResponse<TAddress[]>> {
    return this.executeRequest<TAddress[]>(async () => {
      const response = await this.Get<ServerResponse<TRawAddress[]>>('/addresses')

      return {
        ...response,
        data: Array.isArray(response.data)
          ? response.data.map(item => this.normalizeAddress(item))
          : []
      }
    })
  }

  public async createAddress(
    payload: TAddressPayload
  ): Promise<ServerResponse<TAddress>> {
    return this.executeRequest<TAddress>(async () => {
      const response = await this.Post<ServerResponse<TRawAddress>>(
        '/addresses',
        payload
      )

      return {
        ...response,
        data: this.normalizeAddress(response.data ?? {})
      }
    })
  }

  public async updateAddress(
    id: string,
    payload: TAddressPayload
  ): Promise<ServerResponse<TAddress>> {
    return this.executeRequest<TAddress>(async () => {
      const response = await this.Patch<ServerResponse<TRawAddress>>(
        `/addresses/${id}`,
        payload
      )

      return {
        ...response,
        data: this.normalizeAddress(response.data ?? {})
      }
    })
  }

  public async deleteAddress(
    id: string
  ): Promise<ServerResponse<{ id: string }>> {
    return this.executeRequest<{ id: string }>(async () => {
      const response = await this.Delete<ServerResponse<Record<string, unknown>>>(
        `/addresses/${id}`
      )

      return {
        ...response,
        data: { id }
      }
    })
  }
}
