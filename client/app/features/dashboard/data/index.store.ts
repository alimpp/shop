import { BaseStore } from '~/core/BaseStore'
import { StoreManager } from '~/core/StoreManager'
import type { TDashboardData } from '../types/index.type'

interface IDashboardState {
  data: TDashboardData | null
  loading: boolean
}

const emptyState = (): IDashboardState => ({
  data: null,
  loading: false
})

export class DashboardDS extends BaseStore<IDashboardState> {
  private static _instance: DashboardDS

  public static getInstance(): DashboardDS {
    if (!DashboardDS._instance) {
      DashboardDS._instance = new DashboardDS()
    }
    return DashboardDS._instance
  }

  private constructor() {
    super('admin-dashboard', emptyState())
    StoreManager.register(this)
  }

  public get getData(): TDashboardData | null {
    return this._state.data
  }

  public get getLoading(): boolean {
    return this._state.loading
  }

  public setLoading(loading: boolean): void {
    this._state.loading = loading
  }

  public setData(data: TDashboardData | null): void {
    this._state.data = data
  }

  public reset(): void {
    this._state.data = null
    this._state.loading = false
  }
}

export const useDashboardDS = () => DashboardDS.getInstance()
