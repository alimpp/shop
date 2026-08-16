export function useCurrencyFormatter() {
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat("fa-IR").format(value);
  }

  return {
    formatCurrency
  };
}
