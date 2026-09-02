import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentTransactionStatus } from './enums/payment-transaction-status.enum';
import { PaymentTransactionType } from './enums/payment-transaction-type.enum';

describe('PaymentsService (critical)', () => {
  const paymentRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  let service: PaymentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentsService(paymentRepository as any);
  });

  describe('createForOrder', () => {
    it('creates a success transaction with tracking code', async () => {
      const saved = {
        id: 'pay-1',
        trackingCode: 'TXN-TEST',
        userId: 'u1',
        orderId: 'o1',
        type: PaymentTransactionType.ORDER,
        status: PaymentTransactionStatus.SUCCESS,
        amount: 150000,
        gateway: null,
        gatewayRef: null,
        description: 'پرداخت سفارش PRM-1',
        metadata: { orderNumber: 'PRM-1' },
        createdAt: new Date(),
        updatedAt: new Date(),
        order: null,
        user: null,
      };

      const repo = {
        create: jest.fn((value) => value),
        save: jest.fn().mockResolvedValue(saved),
      };
      const manager = {
        getRepository: jest.fn().mockReturnValue(repo),
      };

      const result = await service.createForOrder(manager as any, {
        userId: 'u1',
        orderId: 'o1',
        orderNumber: 'PRM-1',
        amount: 150000,
        status: PaymentTransactionStatus.SUCCESS,
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u1',
          orderId: 'o1',
          amount: 150000,
          status: PaymentTransactionStatus.SUCCESS,
          type: PaymentTransactionType.ORDER,
        }),
      );
      expect(String(repo.create.mock.calls[0][0].trackingCode)).toMatch(/^TXN-/);
      expect(result).toEqual(saved);
    });
  });

  describe('findOneForUser', () => {
    it('forbids access to another user payment', async () => {
      paymentRepository.findOne.mockResolvedValue({
        id: 'pay-1',
        userId: 'owner',
        orderId: 'o1',
        type: PaymentTransactionType.ORDER,
        status: PaymentTransactionStatus.SUCCESS,
        amount: 1000,
        trackingCode: 'TXN-1',
        gateway: null,
        gatewayRef: null,
        description: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: null,
        user: null,
      });

      await expect(service.findOneForUser('other', 'pay-1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('returns payment for owner', async () => {
      paymentRepository.findOne.mockResolvedValue({
        id: 'pay-1',
        userId: 'owner',
        orderId: 'o1',
        type: PaymentTransactionType.ORDER,
        status: PaymentTransactionStatus.SUCCESS,
        amount: '25000',
        trackingCode: 'TXN-1',
        gateway: null,
        gatewayRef: null,
        description: 'ok',
        metadata: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        order: { id: 'o1', orderNumber: 'PRM-1', status: 'processing', paidAmount: 25000, created_at: new Date() },
        user: null,
      });

      const result = await service.findOneForUser('owner', 'pay-1');
      expect(result.id).toBe('pay-1');
      expect(result.amount).toBe(25000);
      expect(result.order?.orderNumber).toBe('PRM-1');
    });
  });

  describe('updateStatus', () => {
    it('throws when payment missing', async () => {
      paymentRepository.findOne.mockResolvedValue(null);
      await expect(
        service.updateStatus('missing', {
          status: PaymentTransactionStatus.FAILED,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates status and metadata', async () => {
      const entity = {
        id: 'pay-1',
        userId: 'owner',
        orderId: 'o1',
        type: PaymentTransactionType.ORDER,
        status: PaymentTransactionStatus.UNKNOWN,
        amount: 1000,
        trackingCode: 'TXN-1',
        gateway: null,
        gatewayRef: null,
        description: null,
        metadata: { source: 'order_create' },
        createdAt: new Date(),
        updatedAt: new Date(),
        order: null,
        user: null,
      };

      paymentRepository.findOne
        .mockResolvedValueOnce(entity)
        .mockResolvedValueOnce({
          ...entity,
          status: PaymentTransactionStatus.SUCCESS,
          gatewayRef: 'REF-1',
        });
      paymentRepository.save.mockImplementation(async (value) => value);

      const result = await service.updateStatus('pay-1', {
        status: PaymentTransactionStatus.SUCCESS,
        gatewayRef: 'REF-1',
      });

      expect(paymentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: PaymentTransactionStatus.SUCCESS,
          gatewayRef: 'REF-1',
        }),
      );
      expect(result.status).toBe(PaymentTransactionStatus.SUCCESS);
    });
  });
});
