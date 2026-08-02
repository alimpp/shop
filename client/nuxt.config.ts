export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "@vueuse/nuxt"],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL,
      vesrion: process.env.VESRION,
    },
  },

  devtools: {
    enabled: true,
  },

  css: [
    "~/assets/css/main.css",
    "@/assets/css/fonts.css",
    "vue3-toastify/dist/index.css",
  ],

  routeRules: {
    "/api/**": {
      cors: true,
    },
  },

  compatibilityDate: "2024-07-11",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
});
