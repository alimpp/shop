export enum PaymentTransactionStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  UNKNOWN = 'unknown',
}

export const PAYMENT_TRANSACTION_STATUS_LABELS: Record<
  PaymentTransactionStatus,
  string
> = {
  [PaymentTransactionStatus.SUCCESS]: 'موفق',
  [PaymentTransactionStatus.FAILED]: 'ناموفق',
  [PaymentTransactionStatus.UNKNOWN]: 'نامشخص',
};
