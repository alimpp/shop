export enum BehaviorEventType {
  PRODUCT_VIEW = 'product_view',
  GALLERY_VIEW = 'gallery_view',
  LIKE = 'like',
  UNLIKE = 'unlike',
  COMMENT = 'comment',
  FAVORITE = 'favorite',
  UNFAVORITE = 'unfavorite',
  ADD_TO_CART = 'add_to_cart',
  FILTER = 'filter',
}

export const BEHAVIOR_SCORE_WEIGHTS: Record<BehaviorEventType, number> = {
  [BehaviorEventType.PRODUCT_VIEW]: 1,
  [BehaviorEventType.GALLERY_VIEW]: 2,
  [BehaviorEventType.LIKE]: 8,
  [BehaviorEventType.UNLIKE]: -8,
  [BehaviorEventType.COMMENT]: 10,
  [BehaviorEventType.FAVORITE]: 9,
  [BehaviorEventType.UNFAVORITE]: -9,
  [BehaviorEventType.ADD_TO_CART]: 12,
  [BehaviorEventType.FILTER]: 0.5,
};
