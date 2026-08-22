import { useCookie } from "nuxt/app";

import { getAppLoader } from "./useAppLoader";
import { resolveApiBase } from "~/utils/resolveApiBase";

export type CustomFetchOptions = {
  silent?: boolean;
};

function shouldTrackLoader(options: CustomFetchOptions): boolean {
  return import.meta.client && options.silent !== true;
}

let sharedFetch: ReturnType<typeof $fetch.create> | null = null;

export const useCustomFetch = () => {
  if (sharedFetch) {
    return sharedFetch;
  }

  const config = useRuntimeConfig();

  sharedFetch = $fetch.create({
    onRequest({ options }) {
      options.baseURL = resolveApiBase(config.public.apiBase as string | undefined);

      const token = useCookie("token").value;

      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };

      if (shouldTrackLoader(options as CustomFetchOptions)) {
        getAppLoader()?.start();
      }
    },
    onResponse({ options }) {
      if (shouldTrackLoader(options as CustomFetchOptions)) {
        getAppLoader()?.stop();
      }
    },
    onResponseError({ options }) {
      if (shouldTrackLoader(options as CustomFetchOptions)) {
        getAppLoader()?.stop();
      }
    },
    onRequestError({ options, error }) {
      if (shouldTrackLoader(options as CustomFetchOptions)) {
        getAppLoader()?.stop();
      }

      console.error("Request error:", error);
    },
  });

  return sharedFetch;
};
