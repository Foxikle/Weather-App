<script setup lang="ts">
import Header from '@/components/Header.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import useUserPrefs from '@/composables/useUserPrefs'
import {
  calculateDewPoint,
  convertPressure,
  convertSpeed,
  convertTemperature,
  getUVIndex,
  toAbbreviation,
  type WeatherApiResponse,
} from '@/lib/utils'

// Fetch latest weather snapshot
const { data, status, error } = useFetch<WeatherApiResponse>('https://weather-api.foxikle.dev/api/v1/latest')

// Client refresh to avoid SSG baking
const fresh = ref<WeatherApiResponse | null>(data.value ?? null)
const refreshState = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const refreshErr = ref<string | null>(error.value ? String(error.value) : null)

onMounted(async () => {
  refreshState.value = 'loading'
  try {
    const res = await fetch('https://weather-api.foxikle.dev/api/v1/latest')
    if (!res.ok) throw new Error('Failed to fetch latest data')
    fresh.value = await res.json()
    refreshState.value = 'success'
  } catch (e: any) {
    refreshErr.value = e?.message ?? String(e)
    refreshState.value = 'error'
  }
})

const { preferences } = useUserPrefs()

const now = computed(() => new Date())
const tempOut = computed(() => fresh.value?.tempf ?? data.value?.tempf ?? 0)
const tempIn = computed(() => fresh.value?.tempinf ?? data.value?.tempinf ?? 0)
const rhOut = computed(() => fresh.value?.humidity ?? data.value?.humidity ?? 0)
const rhIn = computed(() => fresh.value?.humidityin ?? data.value?.humidityin ?? 0)
const dpOut = computed(() => calculateDewPoint(tempOut.value, preferences.value.temp, rhOut.value))
const dpIn = computed(() => calculateDewPoint(tempIn.value, preferences.value.temp, rhIn.value))
const windSpeed = computed(() => fresh.value?.windspeedmph ?? data.value?.windspeedmph ?? 0)
const windGust = computed(() => fresh.value?.windgustmph ?? data.value?.windgustmph ?? 0)
const windDir = computed(() => fresh.value?.winddir ?? data.value?.winddir ?? 0)
const uv = computed(() => fresh.value?.uv ?? data.value?.uv ?? 0)
const solar = computed(() => fresh.value?.solarradiation ?? data.value?.solarradiation ?? 0)
const barRel = computed(() => fresh.value?.baromrelin ?? data.value?.baromrelin ?? 0)
const barAbs = computed(() => fresh.value?.baromabsin ?? data.value?.baromabsin ?? 0)
const rainDay = computed(() => fresh.value?.dailyrainin ?? data.value?.dailyrainin ?? 0)

useServerSeoMeta({
  title: 'Temp Home — Staged',
  description: 'Staged modern UI for current weather',
})
</script>

<template>
  <div class="container mx-auto max-w-7xl px-4 py-4">

    <div class="mt-6 grid gap-6">
      <!-- Hero -->
      <Card class="overflow-hidden">
        <CardHeader class="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <CardTitle class="text-3xl md:text-4xl">Current Conditions</CardTitle>
            <CardDescription>
              Updated <span class="font-medium">{{ now.toLocaleString() }}</span>
              <span v-if="refreshState === 'error'" class="text-destructive ml-2">(live refresh failed)</span>
            </CardDescription>
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <span class="px-2 py-1 rounded bg-muted">Staged</span>
            <span class="px-2 py-1 rounded bg-muted">{{ uv }} UV • {{ getUVIndex(uv) }}</span>
          </div>
        </CardHeader>
        <hr class="border-t border-border" />
        <CardContent class="py-6">
          <div v-if="status === 'pending' && !fresh" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton class="h-36" />
            <Skeleton class="h-36" />
            <Skeleton class="h-36" />
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardDescription>Outside</CardDescription>
                <CardTitle class="text-5xl">
                  {{ convertTemperature(tempOut, preferences.temp) }}{{ toAbbreviation(preferences.temp) }}
                </CardTitle>
              </CardHeader>
              <CardContent class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-sm text-muted-foreground">Humidity</div>
                  <div class="text-xl">{{ rhOut }}%</div>
                </div>
                <div>
                  <div class="text-sm text-muted-foreground">Dew Point</div>
                  <div class="text-xl">{{ dpOut }}{{ toAbbreviation(preferences.temp) }}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Inside</CardDescription>
                <CardTitle class="text-4xl">
                  {{ convertTemperature(tempIn, preferences.temp) }}{{ toAbbreviation(preferences.temp) }}
                </CardTitle>
              </CardHeader>
              <CardContent class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-sm text-muted-foreground">Humidity</div>
                  <div class="text-xl">{{ rhIn }}%</div>
                </div>
                <div>
                  <div class="text-sm text-muted-foreground">Dew Point</div>
                  <div class="text-xl">{{ dpIn }}{{ toAbbreviation(preferences.temp) }}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Wind</CardDescription>
                <CardTitle class="text-3xl">
                  {{ convertSpeed(windSpeed, preferences.speed) }} {{ toAbbreviation(preferences.speed) }}
                </CardTitle>
              </CardHeader>
              <CardContent class="grid grid-cols-2 gap-4 items-end">
                <div>
                  <div class="text-sm text-muted-foreground">Gust</div>
                  <div class="text-xl">{{ convertSpeed(windGust, preferences.speed) }} {{ toAbbreviation(preferences.speed) }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-muted-foreground">Direction</div>
                  <div class="text-xl">{{ windDir }}°</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <!-- Secondary metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardDescription>Barometric Pressure</CardDescription>
            <CardTitle class="text-2xl">{{ convertPressure(barRel, preferences.pressure) }} {{ toAbbreviation(preferences.pressure) }}</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-sm text-muted-foreground">Absolute: {{ convertPressure(barAbs, preferences.pressure) }} {{ toAbbreviation(preferences.pressure) }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Solar Radiation</CardDescription>
            <CardTitle class="text-2xl">{{ solar }} {{ toAbbreviation(preferences.power) }}</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-sm text-muted-foreground">UV Index: {{ uv }} • {{ getUVIndex(uv) }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Rain (Today)</CardDescription>
            <CardTitle class="text-2xl">{{ rainDay }} {{ toAbbreviation(preferences.distance) }}</CardTitle>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger class="w-full">
                  <div class="flex items-center justify-between text-sm">
                    <span>Gauge</span>
                    <span>{{ (Math.min(rainDay, 1) * 100).toFixed(0) }}%</span>
                  </div>
                  <Progress :model-value="Math.min(rainDay, 1) * 100" />
                </TooltipTrigger>
                <TooltipContent>Scaled to 1 {{ toAbbreviation(preferences.distance) }}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>

      <!-- System status -->
      <Card>
        <CardHeader>
          <CardTitle>System</CardTitle>
          <CardDescription>
            Status: <span :class="{'text-green-600': refreshState==='success', 'text-yellow-600': refreshState==='loading', 'text-red-600': refreshState==='error'}">{{ refreshState }}</span>
            <span v-if="refreshErr" class="ml-2 text-destructive">{{ refreshErr }}</span>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  </div>
</template>
