import { useCookie } from "nuxt/app";

export type CustomFetchOptions = {
  silent?: boolean;
};

function shouldTrackLoader(options: CustomFetchOptions): boolean {
  return import.meta.client && options.silent !== true;
}

export const useCustomFetch = () => {
  const config = useRuntimeConfig();
  const token = useCookie("token").value;
  const { start, stop } = useAppLoader();

  const customFetch = $fetch.create({
    baseURL: config.public.apiBase,

    onRequest({ options }) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };

      if (shouldTrackLoader(options as CustomFetchOptions)) {
        start();
      }
    },
    onResponse({ options }) {
      if (shouldTrackLoader(options as CustomFetchOptions)) {
        stop();
      }
    },
    onResponseError({ options }) {
      if (shouldTrackLoader(options as CustomFetchOptions)) {
        stop();
      }
    },
    onRequestError({ options, error }) {
      if (shouldTrackLoader(options as CustomFetchOptions)) {
        stop();
      }

      console.error("Request error:", error);
    },
  });

  return customFetch;
};
