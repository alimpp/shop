import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CartItem } from '../cart/entities/cart-item.entity';
import { PaymentTransactionStatus } from '../payments/enums/payment-transaction-status.enum';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { Product } from '../product/entities/product.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';
import { OrdersService } from './orders.service';

describe('OrdersService (critical)', () => {
  const dataSource = {
    transaction: jest.fn(),
  };
  const orderRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };
  const cartService = {
    getCart: jest.fn(),
  };
  const addressesService = {
    findOwned: jest.fn(),
  };
  const notificationsService = {
    notify: jest.fn(),
  };
  const paymentsService = {
    createForOrder: jest.fn(),
    findLatestByOrderId: jest.fn(),
  };
  const discountsService = {
    consumeForOrder: jest.fn(),
  };

  let service: OrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrdersService(
      dataSource as any,
      orderRepository as any,
      cartService as any,
      addressesService as any,
      notificationsService as any,
      paymentsService as any,
      discountsService as any,
    );
  });

  function buildManager(options: {
    productStock: number;
    variantStock?: number;
    persistedOrder: Record<string, unknown>;
  }) {
    const cartItemRepo = {
      find: jest.fn().mockResolvedValue([
        {
          productId: 'p1',
          variantId: options.variantStock == null ? null : 'v1',
          quantity: options.variantStock == null ? 2 : 1,
        },
      ]),
      delete: jest.fn(),
    };
    const orderRepo = {
      create: jest.fn((value) => value),
      save: jest.fn().mockResolvedValue(options.persistedOrder),
    };
    const orderItemRepo = {
      create: jest.fn((value) => ({ ...value, id: 'oi-1' })),
      save: jest.fn().mockResolvedValue([]),
    };

    return {
      getRepository: jest.fn((entity: unknown) => {
        if (entity === CartItem) return cartItemRepo;
        if (entity === Order) return orderRepo;
        if (entity === OrderItem) return orderItemRepo;
        return cartItemRepo;
      }),
      findOne: jest.fn().mockImplementation(async (entity: unknown) => {
        if (entity === Product) {
          return {
            id: 'p1',
            manageStock: true,
            allowBackorder: false,
            stock: options.productStock,
            soldCount: 0,
          };
        }
        if (entity === ProductVariant) {
          return {
            id: 'v1',
            name: 'مشکی',
            manageStock: true,
            allowBackorder: false,
            stock: options.variantStock ?? 0,
          };
        }
        return null;
      }),
      save: jest.fn(async (_entity: unknown, value: unknown) => value),
    };
  }

  describe('create', () => {
    it('rejects empty cart before opening transaction', async () => {
      cartService.getCart.mockResolvedValue({ items: [], totalPrice: 0 });

      await expect(
        service.create('user-1', { addressId: 'addr-1' } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('rejects when live stock is insufficient (oversell guard)', async () => {
      cartService.getCart.mockResolvedValue({
        items: [
          {
            productId: 'p1',
            variantId: null,
            quantity: 2,
            unitPrice: 1000,
            lineTotal: 2000,
            product: { name: 'لپ‌تاپ', slug: 'laptop', image: '' },
            variant: null,
            selectedOptions: [],
          },
        ],
        totalPrice: 2000,
      });
      addressesService.findOwned.mockResolvedValue({
        id: 'addr-1',
        name: 'خانه',
        province: 'تهران',
        city: 'تهران',
        address: 'خیابان ۱',
        postalCode: '1234567890',
      });

      dataSource.transaction.mockImplementation(async (cb) =>
        cb(
          buildManager({
            productStock: 1,
            persistedOrder: { id: 'order-1' },
          }),
        ),
      );

      await expect(
        service.create('user-1', { addressId: 'addr-1' } as any),
      ).rejects.toThrow(/موجودی/);
      expect(paymentsService.createForOrder).not.toHaveBeenCalled();
    });

    it('creates order, payment and notifications when stock is enough', async () => {
      cartService.getCart.mockResolvedValue({
        items: [
          {
            productId: 'p1',
            variantId: 'v1',
            quantity: 1,
            unitPrice: 5000,
            lineTotal: 5000,
            product: { name: 'موبایل', slug: 'phone', image: '/a.png' },
            variant: {
              id: 'v1',
              name: 'مشکی',
              sku: 'SKU-1',
              price: 5000,
              salePrice: null,
              image: '',
              options: [],
            },
            selectedOptions: [],
          },
        ],
        totalPrice: 5000,
      });
      addressesService.findOwned.mockResolvedValue({
        id: 'addr-1',
        name: 'خانه',
        province: 'تهران',
        city: 'تهران',
        address: 'خیابان ۱',
        postalCode: '1234567890',
      });
      discountsService.consumeForOrder.mockResolvedValue({
        discountAmount: 0,
        payableAmount: 5000,
        discount: null,
      });
      paymentsService.createForOrder.mockResolvedValue({ id: 'pay-9' });
      paymentsService.findLatestByOrderId.mockResolvedValue(null);

      const persistedOrder = {
        id: 'order-1',
        userId: 'user-1',
        orderNumber: 'PRM-TEST',
        status: OrderStatus.PENDING_CONFIRMATION,
        subtotalAmount: 5000,
        discountAmount: 0,
        discountCode: null,
        discountCodeId: null,
        paidAmount: 5000,
        addressId: 'addr-1',
        address: {},
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
        user: null,
      };

      dataSource.transaction.mockImplementation(async (cb) =>
        cb(
          buildManager({
            productStock: 5,
            variantStock: 5,
            persistedOrder,
          }),
        ),
      );

      orderRepository.findOne.mockResolvedValue({
        ...persistedOrder,
        items: [
          {
            id: 'oi-1',
            productId: 'p1',
            variantId: 'v1',
            productName: 'موبایل',
            productSlug: 'phone',
            productImage: '/a.png',
            quantity: 1,
            unitPrice: 5000,
            lineTotal: 5000,
            variantSnapshot: null,
            selectedOptions: [],
          },
        ],
      });

      const result = await service.create('user-1', {
        addressId: 'addr-1',
      } as any);

      expect(paymentsService.createForOrder).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: PaymentTransactionStatus.SUCCESS,
          amount: 5000,
        }),
      );
      expect(notificationsService.notify).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'order_registered',
          link: '/profile/orders/order-1',
        }),
      );
      expect(notificationsService.notify).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'transaction',
          link: '/profile/payments/pay-9',
        }),
      );
      expect(result.id).toBe('order-1');
    });
  });

  describe('findOneForUser', () => {
    it('forbids access to another user order', async () => {
      orderRepository.findOne.mockResolvedValue({
        id: 'order-1',
        userId: 'owner',
        items: [],
      });

      await expect(
        service.findOneForUser('intruder', 'order-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
