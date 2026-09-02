import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { QueryPaymentsDto } from './dto/query-payments.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { PaymentTransactionStatus } from './enums/payment-transaction-status.enum';
import { PaymentTransactionType } from './enums/payment-transaction-type.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentTransaction)
    private readonly paymentRepository: Repository<PaymentTransaction>,
  ) {}

  async createForOrder(
    manager: EntityManager,
    input: {
      userId: string;
      orderId: string;
      orderNumber: string;
      amount: number;
      status?: PaymentTransactionStatus;
    },
  ) {
    const status = input.status ?? PaymentTransactionStatus.UNKNOWN;
    const repo = manager.getRepository(PaymentTransaction);

    const entity = repo.create({
      trackingCode: this.buildTrackingCode(),
      userId: input.userId,
      orderId: input.orderId,
      type: PaymentTransactionType.ORDER,
      status,
      amount: input.amount,
      gateway: null,
      gatewayRef: null,
      description: `پرداخت سفارش ${input.orderNumber}`,
      metadata: {
        orderNumber: input.orderNumber,
        source: 'order_create',
        gatewayReady: false,
      },
    });

    return repo.save(entity);
  }

  async findAllForUser(userId: string, query: QueryPaymentsDto) {
    return this.findMany({ userId }, query);
  }

  async findAllForAdmin(query: QueryPaymentsDto) {
    return this.findMany({}, query);
  }

  async findOneForUser(userId: string, id: string) {
    const payment = await this.loadOne(id);
    if (payment.userId !== userId) {
      throw new ForbiddenException('دسترسی به این تراکنش مجاز نیست');
    }
    return this.toResponse(payment);
  }

  async findOneForAdmin(id: string) {
    return this.toResponse(await this.loadOne(id));
  }

  async findLatestByOrderId(orderId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { orderId },
      order: { createdAt: 'DESC' },
      relations: { user: true, order: true },
    });
    return payment ? this.toResponse(payment) : null;
  }

  async updateStatus(id: string, dto: UpdatePaymentStatusDto) {
    const payment = await this.loadOne(id);

    payment.status = dto.status;
    if (dto.gatewayRef !== undefined) {
      payment.gatewayRef = dto.gatewayRef.trim() || null;
    }
    if (dto.description !== undefined) {
      payment.description = dto.description.trim() || null;
    }
    payment.metadata = {
      ...(payment.metadata ?? {}),
      lastStatusUpdateAt: new Date().toISOString(),
      lastStatus: dto.status,
    };

    const saved = await this.paymentRepository.save(payment);
    return this.toResponse(await this.loadOne(saved.id));
  }

  private async findMany(
    where: { userId?: string },
    query: QueryPaymentsDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .leftJoinAndSelect('payment.order', 'order')
      .orderBy('payment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (where.userId) {
      qb.andWhere('payment.userId = :userId', { userId: where.userId });
    }
    if (query.status) {
      qb.andWhere('payment.status = :status', { status: query.status });
    }
    if (query.type) {
      qb.andWhere('payment.type = :type', { type: query.type });
    }
    if (query.orderId) {
      qb.andWhere('payment.orderId = :orderId', { orderId: query.orderId });
    }
    if (search) {
      qb.andWhere(
        '(payment.trackingCode ILIKE :search OR payment.gatewayRef ILIKE :search OR payment.description ILIKE :search OR order.orderNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((item) => this.toResponse(item)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  private async loadOne(id: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id } satisfies FindOptionsWhere<PaymentTransaction>,
      relations: { user: true, order: true },
    });

    if (!payment) {
      throw new NotFoundException('تراکنش یافت نشد');
    }

    return payment;
  }

  private buildTrackingCode() {
    const stamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `TXN-${stamp}-${random}`;
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  toResponse(payment: PaymentTransaction) {
    return {
      id: payment.id,
      trackingCode: payment.trackingCode,
      userId: payment.userId,
      orderId: payment.orderId,
      type: payment.type,
      status: payment.status,
      amount: this.toNumber(payment.amount),
      gateway: payment.gateway,
      gatewayRef: payment.gatewayRef,
      description: payment.description,
      metadata: payment.metadata ?? null,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      order: payment.order
        ? {
            id: payment.order.id,
            orderNumber: payment.order.orderNumber,
            status: payment.order.status,
            paidAmount: this.toNumber(payment.order.paidAmount),
            created_at: payment.order.created_at,
          }
        : null,
      user: payment.user
        ? {
            id: payment.user.id,
            fristname: payment.user.fristname,
            lastname: payment.user.lastname,
            phone: payment.user.phone,
          }
        : null,
    };
  }
}
