<script lang="ts" setup>
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '~/components/ui/card'
import {Button} from '~/components/ui/button'
import {Popover, PopoverContent, PopoverTrigger} from '~/components/ui/popover'
import {RangeCalendar} from '~/components/ui/range-calendar'
import useUserPrefs from '~/composables/useUserPrefs'
import {DateFormatter, getLocalTimeZone, parseAbsolute} from '@internationalized/date'
import type {DateRange} from 'radix-vue'
import {
  calculateDewPoint,
  convertDistance,
  convertPower,
  convertPressure,
  convertSpeed,
  convertTemperature,
  toAbbreviation,
  type WeatherRangeApiResponse,
} from '~/lib/utils'
import {useColorMode} from '#imports'

// Page is CSR to simplify chart deps rendering
definePageMeta({ssr: true})

const {preferences, savePreferences} = useUserPrefs()

const df = new DateFormatter('en-US', {dateStyle: 'medium'})

const dateRange = ref<DateRange>({
  start: parseAbsolute(preferences.value.start ?? new Date(Date.now() - 24 * 3600 * 1000).toISOString(), getLocalTimeZone()),
  end: parseAbsolute(preferences.value.end ?? new Date().toISOString(), getLocalTimeZone()),
})

const start_date = ref<string>(dateRange.value.start?.toDate(getLocalTimeZone()).toISOString() ?? new Date(Date.now() - 24 * 3600 * 1000).toISOString())
const end_date = ref<string>(dateRange.value.end?.toDate(getLocalTimeZone()).toISOString() ?? new Date().toISOString())
const segments = ref<number>(preferences.value.segments ?? 100)

watch(dateRange, (val) => {
  start_date.value = val.start?.toDate(getLocalTimeZone()).toISOString() ?? start_date.value
  end_date.value = val.end?.toDate(getLocalTimeZone()).toISOString() ?? end_date.value
  savePreferences({start: start_date.value, end: end_date.value})
  refresh()
})

const {data, status, error, refresh} = useFetch<WeatherRangeApiResponse[]>(
    'https://weather-api.foxikle.dev/api/v2/range',
    {query: {start_date, end_date, segments}}
)

// Data series
const temperature = computed(() => (data.value ?? []).map(d => ({
  ts: new Date(d.datetime).getTime(),
  Inside: convertTemperature(d.averages.tempinf, preferences.value.temp),
  Outside: convertTemperature(d.averages.tempf, preferences.value.temp),
})))

const dewpoint = computed(() => (data.value ?? []).map(d => ({
  ts: new Date(d.datetime).getTime(),
  Inside: calculateDewPoint(d.averages.tempinf, preferences.value.temp, d.averages.humidityin),
  Outside: calculateDewPoint(d.averages.tempf, preferences.value.temp, d.averages.humidity),
})))

const humidity = computed(() => (data.value ?? []).map(d => ({
  ts: new Date(d.datetime).getTime(),
  Inside: d.averages.humidityin,
  Outside: d.averages.humidity,
})))

const uv = computed(() => (data.value ?? []).map(d => ({
  ts: new Date(d.datetime).getTime(),
  Outside: d.averages.uv,
})))

const solar = computed(() => (data.value ?? []).map(d => ({
  ts: new Date(d.datetime).getTime(),
  Outside: convertPower(d.averages.solarradiation, preferences.value.power),
})))

const bp = computed(() => (data.value ?? []).map(d => ({
  ts: new Date(d.datetime).getTime(),
  Absolute: convertPressure(d.averages.baromabsin, preferences.value.pressure),
  Relative: convertPressure(d.averages.baromrelin, preferences.value.pressure),
})))

const rain = computed(() => (data.value ?? []).map(d => ({
  ts: new Date(d.datetime).getTime(),
  Hourly: convertDistance(d.averages.hourlyrainin, preferences.value.distance),
  Daily: convertDistance(d.averages.dailyrainin, preferences.value.distance),
  Weekly: convertDistance(d.averages.weeklyrainin, preferences.value.distance),
  Monthly: convertDistance(d.averages.dailyrainin, preferences.value.distance),
  Total: convertDistance(d.averages.totalrainin, preferences.value.distance),
})))

const wind = computed(() => (data.value ?? []).map(d => ({
  ts: new Date(d.datetime).getTime(),
  Wind: convertSpeed(d.averages.windspeedmph, preferences.value.speed),
  Gust: convertSpeed(d.averages.windgustmph, preferences.value.speed),
  Max_Gust: convertSpeed(d.averages.maxdailygust, preferences.value.speed),
})))

const battery = computed(() => (data.value ?? []).map(d => ({
  ts: new Date(d.datetime).getTime(),
  Base: d.averages.batt_co2 * 100,
  Sensor: d.averages.battout * 100,
})))

const nf = new Intl.NumberFormat('us')
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function getLineOptions(yFormatter?: (val: number) => string) {
  const dark = isDark.value
  const paletteLight = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2', '#a16207', '#f43f5e', '#0ea5e9']
  const paletteDark = ['#60a5fa', '#34d399', '#f87171', '#c084fc', '#fb923c', '#22d3ee', '#facc15', '#fb7185', '#38bdf8']
  const gridColor = dark ? '#2a2e37' : '#e5e7eb'
  const axisColor = dark ? '#9ca3af' : '#374151'
  const foreColor = axisColor
  return {
    chart: {type: 'area', background: 'transparent', foreColor, toolbar: {show: false}, animations: {enabled: true}},
    colors: dark ? paletteDark : paletteLight,
    stroke: {curve: 'smooth', width: 3},
    grid: {
      show: true,
      borderColor: gridColor,
      strokeDashArray: 3,
      xaxis: {lines: {show: false}},
      yaxis: {lines: {show: true}}
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {colors: axisColor},
        datetimeUTC: false
      },
      axisBorder: {color: gridColor},
      axisTicks: {color: gridColor},
    },
    yaxis: {
      labels: {
        style: {colors: axisColor},
        formatter: (val: any) => typeof val === 'number' ? (yFormatter ? yFormatter(val) : nf.format(val)) : ''
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: dark ? 'dark' : 'light',
        shadeIntensity: 0.2,
        opacityFrom: dark ? 0.8 : 0.85,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        type: 'vertical',
      }
    },
    legend: {show: true, labels: {colors: axisColor}},
    tooltip: {theme: dark ? 'dark' : 'light', x: {format: 'MMM dd, yyyy HH:mm'}},
  } as any
}

// Series in Apex format
const temperatureSeries = computed(() => [
  {name: 'Inside', data: temperature.value.map(p => [p.ts, p.Inside])},
  {name: 'Outside', data: temperature.value.map(p => [p.ts, p.Outside])},
])

const dewpointSeries = computed(() => [
  {name: 'Inside', data: dewpoint.value.map(p => [p.ts, p.Inside])},
  {name: 'Outside', data: dewpoint.value.map(p => [p.ts, p.Outside])},
])

const humiditySeries = computed(() => [
  {name: 'Inside', data: humidity.value.map(p => [p.ts, p.Inside])},
  {name: 'Outside', data: humidity.value.map(p => [p.ts, p.Outside])},
])

const bpSeries = computed(() => [
  {name: 'Absolute', data: bp.value.map(p => [p.ts, p.Absolute])},
  {name: 'Relative', data: bp.value.map(p => [p.ts, p.Relative])},
])

const solarSeries = computed(() => [
  {name: 'Outside', data: solar.value.map(p => [p.ts, p.Outside])},
])

const uvSeries = computed(() => [
  {name: 'Outside', data: uv.value.map(p => [p.ts, p.Outside])},
])

const rainSeries = computed(() => [
  {name: 'Hourly', data: rain.value.map(p => [p.ts, p.Hourly])},
  {name: 'Daily', data: rain.value.map(p => [p.ts, p.Daily])},
  {name: 'Weekly', data: rain.value.map(p => [p.ts, p.Weekly])},
  {name: 'Monthly', data: rain.value.map(p => [p.ts, p.Monthly])},
])

const windSeries = computed(() => [
  {name: 'Wind', data: wind.value.map(p => [p.ts, p.Wind])},
  {name: 'Gust', data: wind.value.map(p => [p.ts, p.Gust])},
  {name: 'Max Gust', data: wind.value.map(p => [p.ts, p.Max_Gust])},
])

const batterySeries = computed(() => [
  {name: 'Base', data: battery.value.map(p => [p.ts, p.Base])},
  {name: 'Sensor', data: battery.value.map(p => [p.ts, p.Sensor])},
])
</script>

<template>
  <div class="container mx-auto max-w-7xl px-4 py-4">
    <div class="mt-6 grid gap-6">
      <Card>
        <CardHeader class="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <CardTitle class="text-3xl md:text-4xl">History (Staged)</CardTitle>
            <CardDescription>Select a date range to explore trends.</CardDescription>
          </div>
          <Popover>
            <PopoverTrigger as-child>
              <Button variant="outline">
                <span v-if="dateRange.start && dateRange.end">{{
                    df.format(dateRange.start.toDate(getLocalTimeZone()))
                  }} – {{ df.format(dateRange.end.toDate(getLocalTimeZone())) }}</span>
                <span v-else>Pick range</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <RangeCalendar v-model="dateRange" :number-of-months="2"/>
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card class="p-2">
              <CardTitle>Dew Point ({{ preferences.temp }})</CardTitle>
              <CardContent class="mx-0 px-0">
                <apexchart :options="getLineOptions(v => ' ' + nf.format(v) + toAbbreviation(preferences.temp))"
                           :series="dewpointSeries" height="300" type="line"/>
              </CardContent>
            </Card>

            <Card class="p-2">
              <CardTitle>Temperature ({{ preferences.temp }})</CardTitle>
              <CardContent class="mx-0 px-0">
                <apexchart :options="getLineOptions(v => ' ' + nf.format(v) + toAbbreviation(preferences.temp))"
                           :series="temperatureSeries" height="300" type="line"/>
              </CardContent>
            </Card>

            <Card class="p-2">
              <CardTitle>Relative Humidity</CardTitle>
              <CardContent class="mx-0 px-0">
                <apexchart :options="getLineOptions(v => ' ' + nf.format(v) + '%')" :series="humiditySeries"
                           height="300" type="line"/>
              </CardContent>
            </Card>

            <Card class="p-2">
              <CardTitle>Barometric Pressure ({{ preferences.pressure }})</CardTitle>
              <CardContent class="mx-0 px-0">
                <apexchart :options="getLineOptions(v => ' ' + nf.format(v) + toAbbreviation(preferences.pressure))"
                           :series="bpSeries" height="300" type="line"/>
              </CardContent>
            </Card>

            <Card class="p-2">
              <CardTitle>Solar Radiation ({{ preferences.power }})</CardTitle>
              <CardContent class="mx-0 px-0">
                <apexchart :options="getLineOptions(v => ' ' + nf.format(v) + toAbbreviation(preferences.power))"
                           :series="solarSeries" height="300" type="line"/>
              </CardContent>
            </Card>

            <Card class="p-2">
              <CardTitle>UV Index</CardTitle>
              <CardContent class="mx-0 px-0">
                <apexchart :options="getLineOptions(v => ' ' + nf.format(v))" :series="uvSeries" height="300"
                           type="line"/>
              </CardContent>
            </Card>

            <Card class="p-2">
              <CardTitle>Rainfall ({{ preferences.distance }})</CardTitle>
              <CardContent class="mx-0 px-0">
                <apexchart :options="getLineOptions(v => ' ' + nf.format(v) + toAbbreviation(preferences.distance))"
                           :series="rainSeries" height="300" type="line"/>
              </CardContent>
            </Card>

            <Card class="p-2">
              <CardTitle>Wind Speed ({{ preferences.speed }})</CardTitle>
              <CardContent class="mx-0 px-0">
                <apexchart :options="getLineOptions(v => ' ' + nf.format(v) + toAbbreviation(preferences.speed))"
                           :series="windSeries" height="300" type="line"/>
              </CardContent>
            </Card>

            <Card class="p-2">
              <CardTitle>Battery Levels</CardTitle>
              <CardContent class="mx-0 px-0">
                <apexchart :options="getLineOptions(v => ' ' + nf.format(v) + '%')" :series="batterySeries" height="300"
                           type="line"/>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
