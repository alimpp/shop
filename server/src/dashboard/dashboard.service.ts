import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../cart/entities/cart-item.entity';
import { ChatParticipant } from '../chat/entities/chat-participant.entity';
import { Chat } from '../chat/entities/chat.entity';
import { UserEntity } from '../entities/user.entity';
import { Comment } from '../interactions/entities/comment.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { Product } from '../product/entities/product.entity';
import { ProductStatus } from '../product/enums/product-status.enum';

const REVENUE_EXCLUDED_STATUSES = [
  OrderStatus.CANCELLED,
  OrderStatus.RETURNED,
];

const LOW_STOCK_THRESHOLD = 5;
const CHART_DAYS = 30;

interface RevenueBucketRow {
  date: string;
  revenue: string;
  orders: string;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,

    @InjectRepository(ChatParticipant)
    private readonly participantRepository: Repository<ChatParticipant>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async getDashboard() {
    const [
      revenue,
      orders,
      users,
      products,
      engagement,
      revenueChart,
      recentOrders,
      topProducts,
      lowStockProducts,
      recentUsers,
      ordersByStatus,
    ] = await Promise.all([
      this.getRevenueStats(),
      this.getOrderStats(),
      this.getUserStats(),
      this.getProductStats(),
      this.getEngagementStats(),
      this.getRevenueChart(),
      this.getRecentOrders(),
      this.getTopProducts(),
      this.getLowStockProducts(),
      this.getRecentUsers(),
      this.getOrdersByStatus(),
    ]);

    return {
      revenue,
      orders: {
        ...orders,
        byStatus: ordersByStatus,
      },
      users,
      products,
      engagement,
      revenueChart,
      recentOrders,
      topProducts,
      lowStockProducts,
      recentUsers,
      generatedAt: new Date().toISOString(),
    };
  }

  private revenueBaseQuery() {
    return this.orderRepository
      .createQueryBuilder('order')
      .where('order.status NOT IN (:...excluded)', {
        excluded: REVENUE_EXCLUDED_STATUSES,
      });
  }

  private async sumRevenue(since?: Date, until?: Date): Promise<number> {
    const qb = this.revenueBaseQuery().select(
      'COALESCE(SUM(order.paidAmount), 0)',
      'total',
    );

    if (since) {
      qb.andWhere('order.created_at >= :since', { since });
    }

    if (until) {
      qb.andWhere('order.created_at < :until', { until });
    }

    const row = await qb.getRawOne<{ total: string }>();
    return Number(row?.total ?? 0);
  }

  private async getRevenueStats() {
    const now = new Date();
    const startOfToday = this.startOfDay(now);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    const [
      total,
      today,
      week,
      month,
      previousMonth,
    ] = await Promise.all([
      this.sumRevenue(),
      this.sumRevenue(startOfToday),
      this.sumRevenue(startOfWeek),
      this.sumRevenue(startOfMonth),
      this.sumRevenue(startOfPreviousMonth, startOfMonth),
    ]);

    const monthGrowthPercent =
      previousMonth > 0
        ? Number((((month - previousMonth) / previousMonth) * 100).toFixed(1))
        : null;

    return {
      total,
      today,
      week,
      month,
      previousMonth,
      monthGrowthPercent,
    };
  }

  private async getOrderStats() {
    const startOfToday = this.startOfDay(new Date());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const base = this.orderRepository.createQueryBuilder('order');

    const [
      totalRow,
      todayRow,
      weekRow,
      monthRow,
      averageRow,
      pendingRow,
      processingRow,
      shippingRow,
      cancelledRow,
      returnedRow,
    ] = await Promise.all([
      base.clone().select('COUNT(order.id)', 'count').getRawOne(),
      base
        .clone()
        .select('COUNT(order.id)', 'count')
        .where('order.created_at >= :since', { since: startOfToday })
        .getRawOne(),
      base
        .clone()
        .select('COUNT(order.id)', 'count')
        .where('order.created_at >= :since', { since: startOfWeek })
        .getRawOne(),
      base
        .clone()
        .select('COUNT(order.id)', 'count')
        .where('order.created_at >= :since', { since: startOfMonth })
        .getRawOne(),
      this.revenueBaseQuery()
        .select('COALESCE(AVG(order.paidAmount), 0)', 'average')
        .getRawOne(),
      this.countOrdersByStatus(OrderStatus.PENDING_CONFIRMATION),
      this.countOrdersByStatus(OrderStatus.PROCESSING),
      this.countOrdersByStatus(OrderStatus.SHIPPING),
      this.countOrdersByStatus(OrderStatus.CANCELLED),
      this.countOrdersByStatus(OrderStatus.RETURNED),
    ]);

    return {
      total: Number(totalRow?.count ?? 0),
      today: Number(todayRow?.count ?? 0),
      week: Number(weekRow?.count ?? 0),
      month: Number(monthRow?.count ?? 0),
      averageValue: Number(averageRow?.average ?? 0),
      pending: pendingRow,
      processing: processingRow,
      shipping: shippingRow,
      cancelled: cancelledRow,
      returned: returnedRow,
    };
  }

  private async countOrdersByStatus(status: OrderStatus): Promise<number> {
    return this.orderRepository.count({ where: { status } });
  }

  private async getOrdersByStatus() {
    const rows = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('order.status')
      .getRawMany<{ status: OrderStatus; count: string }>();

    return rows.map((row) => ({
      status: row.status,
      count: Number(row.count ?? 0),
    }));
  }

  private async getUserStats() {
    const startOfToday = this.startOfDay(new Date());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const [total, today, week, month] = await Promise.all([
      this.userRepository.count(),
      this.userRepository
        .createQueryBuilder('user')
        .where('user.created_at >= :since', { since: startOfToday })
        .getCount(),
      this.userRepository
        .createQueryBuilder('user')
        .where('user.created_at >= :since', { since: startOfWeek })
        .getCount(),
      this.userRepository
        .createQueryBuilder('user')
        .where('user.created_at >= :since', { since: startOfMonth })
        .getCount(),
    ]);

    return { total, today, week, month };
  }

  private async getProductStats() {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .where('product.deletedAt IS NULL');

    const [
      total,
      published,
      draft,
      archived,
      inactive,
      featured,
      lowStock,
      outOfStock,
    ] = await Promise.all([
      qb.clone().getCount(),
      qb
        .clone()
        .andWhere('product.status = :status', { status: ProductStatus.PUBLISHED })
        .getCount(),
      qb
        .clone()
        .andWhere('product.status = :status', { status: ProductStatus.DRAFT })
        .getCount(),
      qb
        .clone()
        .andWhere('product.status = :status', { status: ProductStatus.ARCHIVED })
        .getCount(),
      qb.clone().andWhere('product.isActive = false').getCount(),
      qb.clone().andWhere('product.isFeatured = true').getCount(),
      qb
        .clone()
        .andWhere('product.manageStock = true')
        .andWhere('product.stock > 0')
        .andWhere('product.stock <= :threshold', { threshold: LOW_STOCK_THRESHOLD })
        .getCount(),
      qb
        .clone()
        .andWhere('product.manageStock = true')
        .andWhere('product.stock = 0')
        .getCount(),
    ]);

    return {
      total,
      published,
      draft,
      archived,
      inactive,
      featured,
      lowStock,
      outOfStock,
    };
  }

  private async getEngagementStats() {
    const [openChats, unreadRow, cartRow, comments] = await Promise.all([
      this.chatRepository.count({ where: { status: 'open' } }),
      this.participantRepository
        .createQueryBuilder('participant')
        .select('COALESCE(SUM(participant.unseenCount), 0)', 'total')
        .where('participant.adminId IS NOT NULL')
        .getRawOne<{ total: string }>(),
      this.cartItemRepository
        .createQueryBuilder('cartItem')
        .select('COUNT(DISTINCT cartItem.userId)', 'users')
        .addSelect('COUNT(cartItem.id)', 'items')
        .getRawOne<{ users: string; items: string }>(),
      this.commentRepository.count(),
    ]);

    return {
      openChats,
      unreadChats: Number(unreadRow?.total ?? 0),
      activeCarts: Number(cartRow?.users ?? 0),
      cartItems: Number(cartRow?.items ?? 0),
      comments,
    };
  }

  private async getRevenueChart() {
    const since = new Date();
    since.setDate(since.getDate() - (CHART_DAYS - 1));
    since.setHours(0, 0, 0, 0);

    const rows = await this.revenueBaseQuery()
      .select('DATE(order.created_at)', 'date')
      .addSelect('COALESCE(SUM(order.paidAmount), 0)', 'revenue')
      .addSelect('COUNT(order.id)', 'orders')
      .andWhere('order.created_at >= :since', { since })
      .groupBy('DATE(order.created_at)')
      .orderBy('DATE(order.created_at)', 'ASC')
      .getRawMany<RevenueBucketRow>();

    const byDate = new Map(
      rows.map((row) => [
        this.formatDateKey(row.date),
        {
          revenue: Number(row.revenue ?? 0),
          orders: Number(row.orders ?? 0),
        },
      ]),
    );

    const points: Array<{
      date: string;
      revenue: number;
      orders: number;
    }> = [];
    for (let index = 0; index < CHART_DAYS; index += 1) {
      const date = new Date(since);
      date.setDate(since.getDate() + index);
      const key = this.formatDateKey(date);
      const bucket = byDate.get(key);

      points.push({
        date: key,
        revenue: bucket?.revenue ?? 0,
        orders: bucket?.orders ?? 0,
      });
    }

    return points;
  }

  private async getRecentOrders() {
    const rows = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .leftJoin('order.items', 'item')
      .select([
        'order.id AS id',
        'order.orderNumber AS "orderNumber"',
        'order.status AS status',
        'order.paidAmount AS "paidAmount"',
        'order.created_at AS "created_at"',
        'user.fristname AS "firstName"',
        'user.lastname AS "lastName"',
        'user.phone AS phone',
      ])
      .addSelect('COUNT(item.id)', 'itemCount')
      .groupBy('order.id')
      .addGroupBy('user.id')
      .orderBy('order.created_at', 'DESC')
      .limit(8)
      .getRawMany<{
        id: string;
        orderNumber: string;
        status: OrderStatus;
        paidAmount: string;
        created_at: Date;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        itemCount: string;
      }>();

    return rows.map((row) => ({
      id: row.id,
      orderNumber: row.orderNumber,
      status: row.status,
      paidAmount: Number(row.paidAmount ?? 0),
      created_at: row.created_at,
      customerName: [row.firstName, row.lastName].filter(Boolean).join(' ').trim(),
      phone: row.phone ?? '',
      itemCount: Number(row.itemCount ?? 0),
    }));
  }

  private async getTopProducts() {
    const rows = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin(
        'product_medias',
        'media',
        'media.productId = product.id AND media.isThumbnail = true',
      )
      .select([
        'product.id AS id',
        'product.name AS name',
        'product.slug AS slug',
        'product.soldCount AS "soldCount"',
        'product.stock AS stock',
        'product.price AS price',
        'media.url AS image',
      ])
      .where('product.deletedAt IS NULL')
      .orderBy('product.soldCount', 'DESC')
      .addOrderBy('product.viewCount', 'DESC')
      .limit(8)
      .getRawMany<{
        id: string;
        name: string;
        slug: string;
        soldCount: string;
        stock: string;
        price: string;
        image: string | null;
      }>();

    const productIds = rows.map((row) => row.id);
    const revenueByProduct = new Map<string, number>();

    if (productIds.length) {
      const revenueRows = await this.orderItemRepository
        .createQueryBuilder('item')
        .innerJoin('item.order', 'order')
        .select('item.productId', 'productId')
        .addSelect('COALESCE(SUM(item.lineTotal), 0)', 'revenue')
        .where('item.productId IN (:...productIds)', { productIds })
        .andWhere('order.status NOT IN (:...excluded)', {
          excluded: REVENUE_EXCLUDED_STATUSES,
        })
        .groupBy('item.productId')
        .getRawMany<{ productId: string; revenue: string }>();

      revenueRows.forEach((row) => {
        revenueByProduct.set(row.productId, Number(row.revenue ?? 0));
      });
    }

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      soldCount: Number(row.soldCount ?? 0),
      stock: Number(row.stock ?? 0),
      price: Number(row.price ?? 0),
      revenue: revenueByProduct.get(row.id) ?? 0,
      image: row.image ?? null,
    }));
  }

  private async getLowStockProducts() {
    const rows = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin(
        'product_medias',
        'media',
        'media.productId = product.id AND media.isThumbnail = true',
      )
      .select([
        'product.id AS id',
        'product.name AS name',
        'product.slug AS slug',
        'product.sku AS sku',
        'product.stock AS stock',
        'media.url AS image',
      ])
      .where('product.deletedAt IS NULL')
      .andWhere('product.manageStock = true')
      .andWhere('product.isActive = true')
      .andWhere('product.status = :status', { status: ProductStatus.PUBLISHED })
      .andWhere('product.stock <= :threshold', { threshold: LOW_STOCK_THRESHOLD })
      .orderBy('product.stock', 'ASC')
      .addOrderBy('product.name', 'ASC')
      .limit(10)
      .getRawMany<{
        id: string;
        name: string;
        slug: string;
        sku: string;
        stock: string;
        image: string | null;
      }>();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      sku: row.sku,
      stock: Number(row.stock ?? 0),
      image: row.image ?? null,
    }));
  }

  private async getRecentUsers() {
    const rows = await this.userRepository.find({
      select: ['id', 'fristname', 'lastname', 'phone', 'created_at'],
      order: { created_at: 'DESC' },
      take: 6,
    });

    return rows.map((user) => ({
      id: user.id,
      fristname: user.fristname,
      lastname: user.lastname,
      phone: user.phone,
      created_at: user.created_at,
    }));
  }

  private startOfDay(date: Date): Date {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  private formatDateKey(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
