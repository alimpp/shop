import type { ServerResponse } from '~/types/common'
import { BaseApp } from '~/core/BaseApp'
import type {
  TStockMovementListData,
  TStockMovementListQuery
} from '../types/index.type'

type TRaw = Record<string, unknown>

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export class StockMovementsService extends BaseApp<{ id: string }> {
  constructor() {
    super('stock-movements')
  }

  public async getMovements(
    query?: TStockMovementListQuery
  ): Promise<ServerResponse<TStockMovementListData>> {
    return this.executeRequest<TStockMovementListData>(async () => {
      const response = await this.Get<ServerResponse<any>>(
        '/admin/stock-movements',
        query as Record<string, unknown>
      )

      const items = Array.isArray(response.data?.items)
        ? response.data.items.map((item: TRaw) => ({
            id: String(item.id ?? ''),
            productId: (item.productId as string | null) ?? null,
            variantId: (item.variantId as string | null) ?? null,
            orderId: (item.orderId as string | null) ?? null,
            productName: (item.productName as string | null) ?? null,
            variantName: (item.variantName as string | null) ?? null,
            quantityChange: toNumber(item.quantityChange),
            stockBefore: toNumber(item.stockBefore),
            stockAfter: toNumber(item.stockAfter),
            reason: item.reason as TStockMovementListData['items'][number]['reason'],
            reasonLabel: String(item.reasonLabel ?? item.reason ?? ''),
            actorType: item.actorType as TStockMovementListData['items'][number]['actorType'],
            actorLabel: String(item.actorLabel ?? item.actorType ?? ''),
            actorId: (item.actorId as string | null) ?? null,
            note: (item.note as string | null) ?? null,
            createdAt: String(item.createdAt ?? '')
          }))
        : []

      return {
        ...response,
        data: {
          items,
          meta: {
            total: toNumber(response.data?.meta?.total),
            page: toNumber(response.data?.meta?.page, 1),
            limit: toNumber(response.data?.meta?.limit, 30),
            totalPages: toNumber(response.data?.meta?.totalPages, 1)
          }
        }
      }
    })
  }
}
