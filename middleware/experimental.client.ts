export default defineNuxtRouteMiddleware((to) => {
  // Only run on client; preference is stored in localStorage
  if (!process.client) return

  try {
    const raw = localStorage.getItem('weather:prefs:v1')
    const prefs = raw ? JSON.parse(raw) : {}
    const enabled = !!prefs.experimentalUI

    if (!enabled) return

    // Prevent loops: only redirect canonical routes to staged ones
    if (to.path === '/') {
      return navigateTo('/experimental/home')
    }
    if (to.path === '/history') {
      return navigateTo('/experimental/history')
    }
  } catch (e) {
    // Fail open: do nothing on parse errors
    return
  }
})
