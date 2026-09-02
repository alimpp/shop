import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { AddressesService } from '../addresses/addresses.service';
import { CartService } from '../cart/cart.service';
import { CartItem } from '../cart/entities/cart-item.entity';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentsService } from '../payments/payments.service';
import { PaymentTransactionStatus } from '../payments/enums/payment-transaction-status.enum';
import { DiscountsService } from '../discounts/discounts.service';
import { ProductVariant } from '../product/entities/product-variant.entity';
import { Product } from '../product/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    private readonly cartService: CartService,
    private readonly addressesService: AddressesService,
    private readonly notificationsService: NotificationsService,
    private readonly paymentsService: PaymentsService,
    private readonly discountsService: DiscountsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const cart = await this.cartService.getCart(userId);

    if (!cart.items.length) {
      throw new BadRequestException('سبد خرید خالی است');
    }

    const address = await this.addressesService.findOwned(userId, dto.addressId);
    const subtotalAmount = this.toNumber(cart.totalPrice);

    const { order: savedOrder, paymentId } = await this.dataSource.transaction(
      async (manager) => {
        const freshCartItems = await manager.getRepository(CartItem).find({
          where: { userId },
        });

        if (!freshCartItems.length) {
          throw new BadRequestException('سبد خرید خالی است');
        }

        if (freshCartItems.length !== cart.items.length) {
          throw new BadRequestException(
            'سبد خرید تغییر کرده است. لطفاً صفحه را تازه کنید و دوباره تلاش کنید.',
          );
        }

        const freshByKey = new Map(
          freshCartItems.map((item) => [
            `${item.productId ?? ''}:${item.variantId ?? ''}`,
            item,
          ]),
        );

        for (const item of cart.items) {
          const key = `${item.productId ?? ''}:${item.variantId ?? ''}`;
          const fresh = freshByKey.get(key);
          if (!fresh || Number(fresh.quantity) !== Number(item.quantity)) {
            throw new BadRequestException(
              'تعداد اقلام سبد خرید تغییر کرده است. لطفاً دوباره تلاش کنید.',
            );
          }
        }

        await this.assertCartStockAvailable(manager, cart.items);

        const discountResult = await this.discountsService.consumeForOrder(
          manager,
          dto.discountCode,
          subtotalAmount,
        );

        const order = manager.getRepository(Order).create({
          userId,
          orderNumber: this.buildOrderNumber(),
          status: OrderStatus.PENDING_CONFIRMATION,
          subtotalAmount,
          discountAmount: discountResult.discountAmount,
          discountCode: discountResult.discount?.code ?? null,
          discountCodeId: discountResult.discount?.id ?? null,
          paidAmount: discountResult.payableAmount,
          addressId: address.id,
          address: {
            id: address.id,
            name: address.name,
            province: address.province,
            city: address.city,
            address: address.address,
            postalCode: address.postalCode,
          },
        });

        const persisted = await manager.getRepository(Order).save(order);

        const items = cart.items.map((item) =>
          manager.getRepository(OrderItem).create({
            orderId: persisted.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.product.name,
            productSlug: item.product.slug,
            productImage: item.product.image ?? '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
            variantSnapshot: item.variant
              ? {
                  id: item.variant.id,
                  name: item.variant.name,
                  sku: item.variant.sku,
                  price: item.variant.price,
                  salePrice: item.variant.salePrice,
                  image: item.variant.image,
                  options: item.variant.options ?? [],
                }
              : null,
            selectedOptions: item.selectedOptions ?? [],
          }),
        );

        await manager.getRepository(OrderItem).save(items);
        await this.applyStockChange(manager, items, 'decrement');
        await manager.getRepository(CartItem).delete({ userId });

        const payment = await this.paymentsService.createForOrder(manager, {
          userId,
          orderId: persisted.id,
          orderNumber: persisted.orderNumber,
          amount: this.toNumber(persisted.paidAmount),
          status: PaymentTransactionStatus.SUCCESS,
        });

        return { order: persisted, paymentId: payment.id };
      },
    );

    await this.notificationsService.notify({
      userId,
      title: 'ثبت سفارش',
      description: `مشتری عزیز سفارش شما با شماره ${savedOrder.orderNumber} ثبت شد و در انتظار تایید است.`,
      type: NotificationType.ORDER_REGISTERED,
      link: `/profile/orders/${savedOrder.id}`,
    });

    await this.notificationsService.notify({
      userId,
      title: 'پرداخت شما انجام شد',
      description: `ممنون از پرداخت شما 💚 مبلغ سفارش ${savedOrder.orderNumber} با موفقیت ثبت شد. از اعتمادتان سپاسگزاریم؛ به‌زودی وضعیت سفارش را از طریق پیامک هم به شما اطلاع می‌دهیم.`,
      type: NotificationType.TRANSACTION,
      link: `/profile/payments/${paymentId}`,
    });

    return this.findOneForUser(userId, savedOrder.id);
  }

  async findAllForUser(userId: string, query: QueryOrdersDto) {
    return this.findMany({ userId }, query);
  }

  async findAllForAdmin(query: QueryOrdersDto) {
    return this.findMany({}, query);
  }

  async findOneForUser(userId: string, id: string) {
    const order = await this.loadOrder(id);

    if (order.userId !== userId) {
      throw new ForbiddenException('دسترسی به این سفارش مجاز نیست');
    }

    return await this.toResponse(order);
  }

  async findOneForAdmin(id: string) {
    const order = await this.loadOrder(id);
    return await this.toResponse(order);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.loadOrder(id);

    if (order.status === dto.status) {
      return await this.toResponse(order);
    }

    const previousStatus = order.status;

    await this.dataSource.transaction(async (manager) => {
      const locked = await manager.getRepository(Order).findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!locked) {
        throw new NotFoundException('سفارش یافت نشد');
      }

      const items = await manager.getRepository(OrderItem).find({
        where: { orderId: id },
      });

      if (
        this.isStockHoldingStatus(previousStatus) &&
        this.isStockReleasedStatus(dto.status)
      ) {
        await this.applyStockChange(manager, items, 'increment');
      } else if (
        this.isStockReleasedStatus(previousStatus) &&
        this.isStockHoldingStatus(dto.status)
      ) {
        await this.applyStockChange(manager, items, 'decrement');
      }

      locked.status = dto.status;
      await manager.getRepository(Order).save(locked);
    });

    const notice = this.statusNotification(dto.status, order.orderNumber);
    if (notice) {
      await this.notificationsService.notify({
        userId: order.userId,
        ...notice,
      });
    }

    return await this.toResponse(await this.loadOrder(id));
  }

  private async findMany(
    where: { userId?: string },
    query: QueryOrdersDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filters: FindOptionsWhere<Order> = {};

    if (where.userId) {
      filters.userId = where.userId;
    }

    if (query.status) {
      filters.status = query.status;
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where: filters,
      relations: {
        items: true,
        user: true,
      },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: await Promise.all(orders.map((order) => this.toResponse(order))),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private async loadOrder(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException('سفارش یافت نشد');
    }

    return order;
  }

  private buildOrderNumber() {
    const stamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `PRM-${stamp}-${random}`;
  }

  private isStockReleasedStatus(status: OrderStatus) {
    return (
      status === OrderStatus.CANCELLED || status === OrderStatus.RETURNED
    );
  }

  private isStockHoldingStatus(status: OrderStatus) {
    return !this.isStockReleasedStatus(status);
  }

  private async assertCartStockAvailable(
    manager: EntityManager,
    items: Array<{
      productId: string | null;
      variantId: string | null;
      quantity: number;
      product: { name: string };
      variant?: { name?: string } | null;
    }>,
  ) {
    for (const item of items) {
      const quantity = Number(item.quantity) || 0;
      if (quantity <= 0) {
        throw new BadRequestException(
          `تعداد نامعتبر برای محصول «${item.product.name}».`,
        );
      }

      if (item.productId) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new BadRequestException(
            `محصول «${item.product.name}» دیگر در دسترس نیست.`,
          );
        }

        if (
          product.manageStock &&
          !product.allowBackorder &&
          Number(product.stock ?? 0) < quantity
        ) {
          throw new BadRequestException(
            `موجودی لحظه‌ای محصول «${item.product.name}» کافی نیست. موجودی فعلی ${Number(product.stock ?? 0).toLocaleString('fa-IR')} و تعداد درخواستی ${quantity.toLocaleString('fa-IR')} است.`,
          );
        }
      }

      if (item.variantId) {
        const variant = await manager.findOne(ProductVariant, {
          where: { id: item.variantId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!variant) {
          throw new BadRequestException(
            `واریانت محصول «${item.product.name}» دیگر در دسترس نیست.`,
          );
        }

        if (
          variant.manageStock &&
          !variant.allowBackorder &&
          Number(variant.stock ?? 0) < quantity
        ) {
          const variantName = item.variant?.name || variant.name;
          throw new BadRequestException(
            `موجودی لحظه‌ای واریانت «${variantName}» از محصول «${item.product.name}» کافی نیست. موجودی فعلی ${Number(variant.stock ?? 0).toLocaleString('fa-IR')} و تعداد درخواستی ${quantity.toLocaleString('fa-IR')} است.`,
          );
        }
      }
    }
  }

  private async applyStockChange(
    manager: EntityManager,
    items: Array<Pick<OrderItem, 'productId' | 'variantId' | 'quantity' | 'productName'>>,
    direction: 'decrement' | 'increment',
  ) {
    const multiplier = direction === 'decrement' ? -1 : 1;

    for (const item of items) {
      const quantity = Number(item.quantity) || 0;
      if (quantity <= 0) continue;

      if (item.productId) {
        await this.adjustProductStock(
          manager,
          item.productId,
          item.productName,
          quantity,
          multiplier,
        );
      }

      if (item.variantId) {
        await this.adjustVariantStock(
          manager,
          item.variantId,
          item.productName,
          quantity,
          multiplier,
        );
      }
    }
  }

  private async adjustProductStock(
    manager: EntityManager,
    productId: string,
    productName: string,
    quantity: number,
    multiplier: number,
  ) {
    const product = await manager.findOne(Product, {
      where: { id: productId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!product) {
      return;
    }

    if (!product.manageStock) {
      return;
    }

    const nextStock = Number(product.stock ?? 0) + quantity * multiplier;

    if (multiplier < 0 && !product.allowBackorder && nextStock < 0) {
      throw new BadRequestException(
        `موجودی محصول «${productName}» کافی نیست. موجودی فعلی ${Number(product.stock ?? 0).toLocaleString('fa-IR')} و تعداد درخواستی ${quantity.toLocaleString('fa-IR')} است.`,
      );
    }

    product.stock = Math.max(0, nextStock);
    product.soldCount = Math.max(
      0,
      Number(product.soldCount ?? 0) + quantity * (multiplier < 0 ? 1 : -1),
    );
    await manager.save(Product, product);
  }

  private async adjustVariantStock(
    manager: EntityManager,
    variantId: string,
    productName: string,
    quantity: number,
    multiplier: number,
  ) {
    const variant = await manager.findOne(ProductVariant, {
      where: { id: variantId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!variant) {
      throw new BadRequestException(
        `واریانت محصول «${productName}» یافت نشد و امکان بروزرسانی موجودی وجود ندارد.`,
      );
    }

    if (!variant.manageStock) {
      return;
    }

    const nextStock = Number(variant.stock ?? 0) + quantity * multiplier;

    if (multiplier < 0 && !variant.allowBackorder && nextStock < 0) {
      throw new BadRequestException(
        `موجودی واریانت «${variant.name}» از محصول «${productName}» کافی نیست. موجودی فعلی ${Number(variant.stock ?? 0).toLocaleString('fa-IR')} و تعداد درخواستی ${quantity.toLocaleString('fa-IR')} است.`,
      );
    }

    variant.stock = Math.max(0, nextStock);
    await manager.save(ProductVariant, variant);
  }

  private statusNotification(status: OrderStatus, orderNumber: string) {
    switch (status) {
      case OrderStatus.PROCESSING:
        return {
          title: 'تایید سفارش',
          description: `مشتری عزیز سفارش شما با شماره ${orderNumber} تایید شد و در حال پردازش است.`,
          type: NotificationType.ORDER_CONFIRMED,
        };
      case OrderStatus.SHIPPING:
        return {
          title: 'ارسال سفارش',
          description: `مشتری عزیز سفارش شما با شماره ${orderNumber} در حال ارسال است.`,
          type: NotificationType.ORDER_SHIPPING,
        };
      case OrderStatus.SUCCESS:
        return {
          title: 'تکمیل سفارش',
          description: `مشتری عزیز سفارش شما با شماره ${orderNumber} با موفقیت تکمیل شد.`,
          type: NotificationType.ORDER_COMPLETED,
        };
      case OrderStatus.CANCELLED:
        return {
          title: 'لغو سفارش',
          description: `مشتری عزیز سفارش شما با شماره ${orderNumber} لغو شد.`,
          type: NotificationType.ORDER_CANCELLED,
        };
      case OrderStatus.RETURNED:
        return {
          title: 'مرجوع سفارش',
          description: `اگر به هر دلیلی محصول برای شما ارسال نشد یا مرجوع شد، از سمت پشتیبانی با شما تماس گرفته می‌شود و مبلغ عودت داده می‌شود. شماره سفارش: ${orderNumber}`,
          type: NotificationType.ORDER_RETURNED,
        };
      case OrderStatus.PENDING_CONFIRMATION:
        return {
          title: 'ثبت سفارش',
          description: `مشتری عزیز سفارش شما با شماره ${orderNumber} دوباره در انتظار تایید قرار گرفت.`,
          type: NotificationType.ORDER_REGISTERED,
        };
      default:
        return null;
    }
  }

  async updateStatusByUser(userId: string, id: string, dto: UpdateOrderStatusDto) {
    const order = await this.loadOrder(id);

    if (order.userId !== userId) {
      throw new ForbiddenException('دسترسی به این سفارش مجاز نیست');
    }

    const allowedStatuses: OrderStatus[] = [OrderStatus.SUCCESS];
    if (!allowedStatuses.includes(dto.status)) {
      throw new BadRequestException('تغییر این وضعیت توسط کاربر مجاز نیست');
    }

    if (order.status === dto.status) {
      return await this.toResponse(order);
    }

    const previousStatus = order.status;

    await this.dataSource.transaction(async (manager) => {
      const locked = await manager.getRepository(Order).findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!locked) {
        throw new NotFoundException('سفارش یافت نشد');
      }

      const items = await manager.getRepository(OrderItem).find({
        where: { orderId: id },
      });

      if (
        this.isStockHoldingStatus(previousStatus) &&
        this.isStockReleasedStatus(dto.status)
      ) {
        await this.applyStockChange(manager, items, 'increment');
      } else if (
        this.isStockReleasedStatus(previousStatus) &&
        this.isStockHoldingStatus(dto.status)
      ) {
        await this.applyStockChange(manager, items, 'decrement');
      }

      locked.status = dto.status;
      await manager.getRepository(Order).save(locked);
    });

    const notice = this.statusNotification(dto.status, order.orderNumber);
    if (notice) {
      await this.notificationsService.notify({
        userId: order.userId,
        ...notice,
      });
    }

    return await this.toResponse(await this.loadOrder(id));
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private async toResponse(order: Order) {
    const items = (order.items ?? []).map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      productSlug: item.productSlug,
      productImage: item.productImage,
      quantity: item.quantity,
      unitPrice: this.toNumber(item.unitPrice),
      lineTotal: this.toNumber(item.lineTotal),
      variant: item.variantSnapshot,
      selectedOptions: item.selectedOptions ?? [],
    }));

    const payment = order.id
      ? await this.paymentsService.findLatestByOrderId(order.id)
      : null;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      subtotalAmount: this.toNumber(order.subtotalAmount ?? order.paidAmount),
      discountAmount: this.toNumber(order.discountAmount),
      discountCode: order.discountCode ?? null,
      discountCodeId: order.discountCodeId ?? null,
      paidAmount: this.toNumber(order.paidAmount),
      addressId: order.addressId,
      address: order.address,
      items,
      itemCount: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      payment,
      created_at: order.created_at,
      updated_at: order.updated_at,
      user: order.user
        ? {
            id: order.user.id,
            fristname: order.user.fristname,
            lastname: order.user.lastname,
            phone: order.user.phone,
          }
        : null,
    };
  }
}
