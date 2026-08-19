import { BaseStore } from '~/core/BaseStore'
import { StoreManager } from '~/core/StoreManager'
import { AddressModel } from '../models/index.model'
import type { TAddress } from '../types/index.type'

interface IAddressesState {
  addresses: AddressModel[]
  selectedAddress: AddressModel | null
  loading: boolean
  submitting: boolean
}

export class AddressesDS extends BaseStore<IAddressesState> {
  private static _instance: AddressesDS

  public static getInstance(): AddressesDS {
    if (!AddressesDS._instance) {
      AddressesDS._instance = new AddressesDS()
    }
    return AddressesDS._instance
  }

  private constructor() {
    super('addresses', {
      addresses: [],
      selectedAddress: null,
      loading: false,
      submitting: false
    })
    StoreManager.register(this)
  }

  public get getAddresses(): AddressModel[] {
    return this._state.addresses
  }

  public get getSelectedAddress(): AddressModel | null {
    return this._state.selectedAddress
  }

  public get getLoading(): boolean {
    return this._state.loading
  }

  public get getSubmitting(): boolean {
    return this._state.submitting
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading
  }

  public setSubmitting(submitting: boolean): void {
    this._state.submitting = submitting
  }

  public setAddresses(addresses: TAddress[]): void {
    this._state.addresses = addresses.map(item => new AddressModel(item))
  }

  public setSelectedAddress(address: TAddress | null): void {
    this._state.selectedAddress = address ? new AddressModel(address) : null
  }

  public upsertAddress(address: TAddress): void {
    const model = new AddressModel(address)
    const index = this._state.addresses.findIndex(item => item.id === model.id)

    if (index === -1) {
      this._state.addresses = [model, ...this._state.addresses]
      return
    }

    this._state.addresses.splice(index, 1, model)
  }

  public removeAddress(id: string): void {
    this._state.addresses = this._state.addresses.filter(item => item.id !== id)
    if (this._state.selectedAddress?.id === id) {
      this._state.selectedAddress = null
    }
  }

  public reset(): void {
    this._state.addresses = []
    this._state.selectedAddress = null
    this._state.loading = false
    this._state.submitting = false
  }
}

export const useAddressesDS = () => AddressesDS.getInstance()
