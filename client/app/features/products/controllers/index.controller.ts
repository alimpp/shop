import type { ControllerResponse, ServerResponse } from '~/types/common'

import { BaseController } from '~/core/BaseController'
import { ProductsDS } from '../data/index.store'
import { ProductsService } from '../services/index.service'

import type {
  TProduct,
  TProductAttributeWithValues,
  TProductBrandRef,
  TProductListData,
  TProductListQuery,
  TProductPayload,
  TProductSuggestData
} from '../types/index.type'

class ProductsController extends BaseController<ProductsService> {
  constructor() {
    super(new ProductsService())
  }

  private readonly productsDS = ProductsDS.getInstance()

  public async getProducts(
    query?: TProductListQuery
  ): Promise<ControllerResponse<TProductListData>> {
    this.productsDS.setLoading(true)

    const cachedProducts = this.service.getCachedProducts()
    if (cachedProducts) {
      this.productsDS.setProducts(cachedProducts.items)
    }

    const response: ServerResponse<TProductListData>
      = await this.service.getProducts(query)

    if (response.success) {
      this.productsDS.setProducts(response.data.items)
    }

    this.productsDS.setLoading(false)

    return this.handleResponse(response)
  }

  public async createProduct(
    payload: TProductPayload
  ): Promise<ControllerResponse<TProduct>> {
    this.productsDS.setSubmitting(true)

    const response: ServerResponse<TProduct>
      = await this.service.createProduct(payload)

    if (response.success) {
      this.productsDS.upsertProduct(response.data)
      this.service.saveProductsCache(this.productsDS.getProducts)
    }

    this.productsDS.setSubmitting(false)

    return this.handleResponse(response)
  }

  public async getProductById(
    id: string
  ): Promise<ControllerResponse<TProduct>> {
    const response: ServerResponse<TProduct>
      = await this.service.getProductById(id)

    if (response.success) {
      this.productsDS.setSelectedProduct(response.data)
    }

    return this.handleResponse(response)
  }

  public async getProductBySlug(
    slug: string
  ): Promise<ControllerResponse<TProduct>> {
    const response: ServerResponse<TProduct>
      = await this.service.getProductBySlug(slug)

    if (response.success) {
      this.productsDS.setSelectedProduct(response.data)
    }

    return this.handleResponse(response)
  }

  public async updateProduct(
    id: string,
    payload: TProductPayload
  ): Promise<ControllerResponse<TProduct>> {
    this.productsDS.setSubmitting(true)

    const response: ServerResponse<TProduct>
      = await this.service.updateProduct(id, payload)

    if (response.success) {
      this.productsDS.upsertProduct(response.data)
      this.productsDS.setSelectedProduct(response.data)
      this.service.saveProductsCache(this.productsDS.getProducts)
    }

    this.productsDS.setSubmitting(false)

    return this.handleResponse(response)
  }

  public async deleteProduct(
    id: string
  ): Promise<ControllerResponse<{ id: string }>> {
    this.productsDS.setSubmitting(true)

    const response: ServerResponse<{ id: string }>
      = await this.service.deleteProduct(id)

    if (response.success) {
      this.productsDS.removeProduct(id)
      if (this.productsDS.getSelectedProduct?.id === id) {
        this.productsDS.setSelectedProduct(null)
      }
      this.service.saveProductsCache(this.productsDS.getProducts)
    }

    this.productsDS.setSubmitting(false)

    return this.handleResponse(response)
  }

  public async getBestsellers(
    limit = 10
  ): Promise<ControllerResponse<TProduct[]>> {
    const response = await this.service.getBestsellers(limit)
    return this.handleResponse(response)
  }

  public async getDiscounted(
    limit = 10
  ): Promise<ControllerResponse<TProduct[]>> {
    const response = await this.service.getDiscounted(limit)
    return this.handleResponse(response)
  }

  public async getBrands(): Promise<ControllerResponse<TProductBrandRef[]>> {
    const response: ServerResponse<TProductBrandRef[]>
      = await this.service.getBrands()

    return this.handleResponse(response)
  }

  public async getAttributes(): Promise<ControllerResponse<TProductAttributeWithValues[]>> {
    const response: ServerResponse<TProductAttributeWithValues[]>
      = await this.service.getAttributes()

    return this.handleResponse(response)
  }

  public async getFilterAttributes(
    query?: TProductListQuery
  ): Promise<ControllerResponse<TProductAttributeWithValues[]>> {
    const response: ServerResponse<TProductAttributeWithValues[]>
      = await this.service.getFilterAttributes(query)

    return this.handleResponse(response)
  }

  public async suggest(
    q: string,
    limit = 8
  ): Promise<ControllerResponse<TProductSuggestData>> {
    const response = await this.service.suggest(q, limit)
    return this.handleResponse(response)
  }
}

export const productsController = new ProductsController()
