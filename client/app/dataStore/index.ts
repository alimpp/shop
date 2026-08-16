import { CategoriesDS } from '~/features/categories/data/index.store'
import { FilesDS } from '~/features/files/data/index.store'
import { BrandsDS } from '~/features/brands/data/index.store'
import { BannersDS } from '~/features/banners/data/index.store'
import { AttributesDS } from '~/features/attributes/data/index.store'
import { ProductsDS } from '~/features/products/data/index.store'
import { AdminDS } from '~/features/profile/admin/data/index.store'
import { useUserProfileDS as getProfileDS } from '~/features/profile/user/data/index.store'
import { useCartDS as getCartDS } from '~/features/cart/data/index.store'
import { StoriesDS } from '~/features/stories/data/index.store'
import { BlogsDS } from '~/features/blogs/data/index.store'
import { ChatDS } from '~/features/chat/data/index.store'

export const initializeStores = () => {
  CategoriesDS.getInstance()
  FilesDS.getInstance()
  BrandsDS.getInstance()
  BannersDS.getInstance()
  AttributesDS.getInstance()
  ProductsDS.getInstance()
  StoriesDS.getInstance()
  BlogsDS.getInstance()
  AdminDS.getInstance()
  ChatDS.getInstance()
  getProfileDS()
  getCartDS()
}

initializeStores()

export const useAdminDS = () => AdminDS.getInstance()
export const useUserProfileDS = () => getProfileDS()
export const useCartDS = () => getCartDS()
export const useCategoriesDS = () => CategoriesDS.getInstance()
export const useFilesDS = () => FilesDS.getInstance()
export const useBrandsDS = () => BrandsDS.getInstance()
export const useBannersDS = () => BannersDS.getInstance()
export const useAttributesDS = () => AttributesDS.getInstance()
export const useProductsDS = () => ProductsDS.getInstance()
export const useStoriesDS = () => StoriesDS.getInstance()
export const useBlogsDS = () => BlogsDS.getInstance()
export const useChatDS = () => ChatDS.getInstance()
