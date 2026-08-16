import { useCookie } from "nuxt/app";

export const useCustomFetch = () => {
  const config = useRuntimeConfig();
  const token = useCookie("token").value;

  const customFetch = $fetch.create({
    baseURL: config.public.apiBase,

    onRequest({ options }) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    },
    onRequestError({ error }) {
      console.error("Request error:", error);
    },
  });

  return customFetch;
};
