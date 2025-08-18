export default defineNuxtRouteMiddleware((to) => {
  if (!process.client) return
  try {
    const raw = localStorage.getItem('weather:prefs:v1')
    const prefs = raw ? JSON.parse(raw) : {}
    const enabled = !!prefs.experimentalUI
    if (!enabled) return
    if (to.path === '/') return navigateTo('/experimental/home')
    if (to.path === '/history') return navigateTo('/experimental/history')
  } catch {
    return
  }
})
