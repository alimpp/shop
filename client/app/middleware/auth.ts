import { defineNuxtRouteMiddleware, navigateTo, useCookie } from "nuxt/app";

export default defineNuxtRouteMiddleware(() => {
  const token = useCookie("token");
  if (!token.value) {
    return navigateTo("/auth/login");
  }
});
