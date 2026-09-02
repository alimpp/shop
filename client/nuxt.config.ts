export default defineNuxtConfig({
  modules: [
    "@nuxt/ui",
    "@nuxt/image",
    "@vueuse/nuxt",
    "nuxt-schema-org",
    "@nuxtjs/robots",
    "@nuxtjs/sitemap",
  ],

  site: {
    url:
      process.env.SITE_URL ??
      (process.env.NODE_ENV === "production"
        ? "https://shop.example.com"
        : "http://localhost:3000"),
    name: "فروشگاه دیجیتال",
  },

  schemaOrg: {
    identity: {
      type: "Organization",
      name: "فروشگاه دیجیتال",
      logo: "/image/logo/logo.png",
    },
  },

  robots: {
    disallow: ["/admin/", "/profile/", "/cart", "/auth/"],
  },

  sitemap: {
    exclude: [
      "/admin/**",
      "/profile/**",
      "/cart",
      "/auth/**",
    ],
    sources: ["/api/sitemap-products"],
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL,
      vesrion: process.env.VESRION,
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || "",
      sentryTracesSampleRate:
        process.env.NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || "0.1",
    },
  },

  devtools: {
    enabled: process.env.NUXT_DEVTOOLS === "true",
  },

  vite: {
    server: {
      host: true,
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "@vueuse/core"],
    },
  },

  css: [
    "~/assets/css/main.css",
    "@/assets/css/fonts.css",
    "vue3-toastify/dist/index.css",
  ],

  fonts: {
    providers: {
      fontshare: false,
      google: false,
      bunny: false,
      fontsource: false,
      adobe: false,
    },
  },

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
