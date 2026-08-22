export function hydrateStoreFromPayload<T>(
  data: Ref<T | null | undefined>,
  hydrate: (value: T) => void,
): void {
  watch(
    data,
    (value) => {
      if (value != null) {
        hydrate(value);
      }
    },
    { immediate: true },
  );
}
