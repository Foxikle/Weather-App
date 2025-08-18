<script lang="ts" setup>

definePageMeta({ssr: false})

// ApexCharts is registered via plugins/apexcharts.client.ts
import {DateFormatter, getLocalTimeZone, parseAbsolute} from "@internationalized/date";
import {RangeCalendar} from '@/components/ui/range-calendar'
import {Button} from '@/components/ui/button'
import useUserPrefs from "~/composables/useUserPrefs";
import type {DateRange} from "radix-vue";
import {computed, ref, watch} from "vue";
import {
  calculateDewPoint,
  cn,
  convertDistance,
  convertPower,
  convertPressure,
  convertSpeed,
  convertTemperature,
  toAbbreviation,
  type WeatherApiResponse
} from "~/lib/utils";
import {Popover, PopoverContent, PopoverTrigger} from "~/components/ui/popover";
import {Icon} from "@iconify/vue";

const {preferences, loading, savePreferences, onPreferencesChange} = useUserPrefs()


onPreferencesChange(newPreferences => {
  dateRange.value.start = parseAbsolute(newPreferences.start);
  dateRange.value.end = parseAbsolute(newPreferences.end);
  refresh()
});

const df = new DateFormatter('en-US', {
  dateStyle: 'medium',
})

const datetimeFormatter = new DateFormatter('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: getLocalTimeZone()
})

const dateRange = ref<DateRange>({
  start: parseAbsolute(preferences.value.start, "UTC"),
  end: parseAbsolute(preferences.value.end, "UTC"),
})

const __now = new Date();
const __last24 = new Date(__now.getTime() - 24 * 60 * 60 * 1000);
const start_date = ref<string>(preferences.value.start ?? __last24.toISOString())
const end_date = ref<string>(preferences.value.end ?? __now.toISOString())
const segments = ref<number>(preferences.value.segments ?? 100)

watch(dateRange, (newValue) => {
  console.log(newValue)
  start_date.value = newValue.start?.toDate(getLocalTimeZone()).toISOString() ?? __last24.toISOString();
  end_date.value = newValue.end?.toDate(getLocalTimeZone()).toISOString() ?? __now.toISOString();

  if ((start_date.value && end_date.value) && (start_date.value !== '' && end_date.value !== '')) {
    refresh()
  } else {
    console.log("Not refreshing")
  }

  savePreferences({
    start: start_date.value,
    end: end_date.value,
  });
});

console.log(preferences.value.end)
console.log(preferences.value.start)


const {data, status, error, refresh} = useFetch<WeatherApiResponse[]>('https://weather-api.foxikle.dev/api/v2/range', {
  query: {
    start_date,
    end_date,
    segments
  }
});


const dewpoint = computed(() => {
  if (!data.value || data.value.length <= 0) return []
  return data.value.map(item => ({
    ts: new Date(item.datetime).getTime(),
    Inside: calculateDewPoint(item.averages.tempinf, preferences.value.temp, item.averages.humidityin),
    Outside: calculateDewPoint(item.averages.tempf, preferences.value.temp, item.averages.humidity)
  }));
})

const temperature = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      ts: new Date(item.datetime).getTime(),
      Inside: convertTemperature(item.averages.tempinf, preferences.value.temp),
      Outside: convertTemperature(item.averages.tempf, preferences.value.temp),
    }));
  }
  return [];
})

const humidity = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      ts: new Date(item.datetime).getTime(),
      Inside: item.averages.humidityin,
      Outside: item.averages.humidity
    }));
  }
  return [];
})

// Light Tempurature
const uv = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      ts: new Date(item.datetime).getTime(),
      Outside: item.averages.uv, // not converted
    }));
  }
  return [];
})

const solar = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      ts: new Date(item.datetime).getTime(),
      Outside: convertPower(item.averages.solarradiation, preferences.value.power),
    }));
  }
  return [];
})

const bp = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      ts: new Date(item.datetime).getTime(),
      Absolute: convertPressure(item.averages.baromabsin, preferences.value.pressure),
      Relative: convertPressure(item.averages.baromrelin, preferences.value.pressure),
    }));
  }
  return [];
})

const rain = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      ts: new Date(item.datetime).getTime(),
      Hourly: convertDistance(item.averages.hourlyrainin, preferences.value.distance),
      Daily: convertDistance(item.averages.dailyrainin, preferences.value.distance),
      Weekly: convertDistance(item.averages.weeklyrainin, preferences.value.distance),
      Monthly: convertDistance(item.averages.dailyrainin, preferences.value.distance),
      Total: convertDistance(item.averages.totalrainin, preferences.value.distance),
    }));
  }
  return [];
})

const wind = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      ts: new Date(item.datetime).getTime(),
      Wind: convertSpeed(item.averages.windspeedmph, preferences.value.speed),
      Gust: convertSpeed(item.averages.windgustmph, preferences.value.speed),
      Max_Gust: convertSpeed(item.averages.maxdailygust, preferences.value.speed),
    }));
  }
  return [];
})

const battery = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      ts: new Date(item.datetime).getTime(),
      Base: item.averages.batt_co2 * 100,
      Sensor: item.averages.battout * 100,
    }));
  }
  return [];
})

function format(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).replaceAll("_", " ");
}

useServerSeoMeta({
  title: 'Weather History',
  ogTitle: 'Weather History',
  description: `View the historic weather data collected by this website!`,
  ogDescription: `View the historic weather data collected by this website!`,
  author: 'Foxikle',
  ogUrl: 'https://weather.foxikle.dev',
});

const nf = new Intl.NumberFormat('us')

import { useColorMode } from '#imports'
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function getLineOptions(yFormatter?: (val: number) => string) {
  const dark = isDark.value
  const paletteLight = [
    '#2563eb', // blue-600
    '#16a34a', // green-600
    '#dc2626', // red-600
    '#9333ea', // purple-600
    '#ea580c', // orange-600
    '#0891b2', // cyan-600
    '#a16207', // yellow-700
    '#f43f5e', // rose-500
    '#0ea5e9', // sky-500
  ]
  const paletteDark = [
    '#60a5fa', // blue-400
    '#34d399', // emerald-400
    '#f87171', // red-400
    '#c084fc', // purple-400
    '#fb923c', // orange-400
    '#22d3ee', // cyan-400
    '#facc15', // yellow-400
    '#fb7185', // rose-400
    '#38bdf8', // sky-400
  ]

  const gridColor = dark ? '#2a2e37' : '#e5e7eb' // slate-800 vs gray-200
  const axisColor = dark ? '#9ca3af' : '#374151' // gray-400 vs gray-700
  const foreColor = axisColor

  return {
    chart: {
      type: 'area',
      background: 'transparent',
      foreColor,
      toolbar: { show: false },
      animations: { enabled: true },
    },
    colors: dark ? paletteDark : paletteLight,
    stroke: { curve: 'smooth', width: 3 },
    grid: {
      show: true,
      borderColor: gridColor,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      type: 'datetime',
      labels: { style: { colors: axisColor } },
      axisBorder: { color: gridColor },
      axisTicks: { color: gridColor },
    },
    yaxis: {
      labels: {
        style: { colors: axisColor },
        formatter: (val: any) => {
          return typeof val === 'number' ? (yFormatter ? yFormatter(val) : nf.format(val)) : ''
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: dark ? 'dark' : 'light',
        shadeIntensity: 0.2,
        opacityFrom: dark ? 0.2 : 0.25,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    legend: { show: true, labels: { colors: axisColor } },
    tooltip: { theme: dark ? 'dark' : 'light', x: { format: 'MMM dd, yyyy HH:mm' } },
  } as any
}

const temperatureSeries = computed(() => [
  {name: 'Inside', data: temperature.value.map(p => [p.ts, p.Inside])},
  {name: 'Outside', data: temperature.value.map(p => [p.ts, p.Outside])}
])

const dewpointSeries = computed(() => [
  {name: 'Inside', data: dewpoint.value.map(p => [p.ts, p.Inside])},
  {name: 'Outside', data: dewpoint.value.map(p => [p.ts, p.Outside])}
])

const humiditySeries = computed(() => [
  {name: 'Inside', data: humidity.value.map(p => [p.ts, p.Inside])},
  {name: 'Outside', data: humidity.value.map(p => [p.ts, p.Outside])}
])

const bpSeries = computed(() => [
  {name: 'Absolute', data: bp.value.map(p => [p.ts, p.Absolute])},
  {name: 'Relative', data: bp.value.map(p => [p.ts, p.Relative])}
])

const solarSeries = computed(() => [
  {name: 'Outside', data: solar.value.map(p => [p.ts, p.Outside])}
])

const uvSeries = computed(() => [
  {name: 'Outside', data: uv.value.map(p => [p.ts, p.Outside])}
])

const rainSeries = computed(() => [
  {name: 'Hourly', data: rain.value.map(p => [p.ts, p.Hourly])},
  {name: 'Daily', data: rain.value.map(p => [p.ts, p.Daily])},
  {name: 'Weekly', data: rain.value.map(p => [p.ts, p.Weekly])},
  {name: 'Monthly', data: rain.value.map(p => [p.ts, p.Monthly])}
])

const windSeries = computed(() => [
  {name: 'Wind', data: wind.value.map(p => [p.ts, p.Wind])},
  {name: 'Gust', data: wind.value.map(p => [p.ts, p.Gust])},
  {name: 'Max Gust', data: wind.value.map(p => [p.ts, p.Max_Gust])}
])

const batterySeries = computed(() => [
  {name: 'Base', data: battery.value.map(p => [p.ts, p.Base])},
  {name: 'Sensor', data: battery.value.map(p => [p.ts, p.Sensor])}
])

</script>

<template>
  <article class="px-5 mx-5">
    <h1 v-if="error"> ERROR: {{ error }}</h1>
    <!--  Range Picker -->
    <div class="flex items-center flex-col m-2">
      <Popover class="self-center">
        <PopoverTrigger as-child>
          <Button
              :class="cn(
          'w-[280px] justify-start text-left font-normal',
          !dateRange && 'text-muted-foreground',
        )"
              variant="outline"
          >
            <Icon class="mr-2 h-4 w-4" icon="mdi:calendar"/>
            <template v-if="dateRange.start">
              <template v-if="dateRange.end">
                {{ df.format(dateRange.start.toDate(getLocalTimeZone())) }} -
                {{ df.format(dateRange.end.toDate(getLocalTimeZone())) }}
              </template>

              <template v-else>
                {{ df.format(dateRange.start.toDate(getLocalTimeZone())) }}
              </template>
            </template>
            <template v-else>
              Pick a date range
            </template>
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
          <RangeCalendar v-model="dateRange" :number-of-months="1" initial-focus
                         @update:start-value="(startDate) => dateRange.start = startDate"
                         @update:model-value="(endDate) => dateRange = endDate"

          />
        </PopoverContent>
      </Popover>
    </div>
    <div class="grid-cols-1 xl:grid-cols-2 grid gap-2">
      <!--  Dewpoint chart -->
      <Card class="p-2 m-1">
        <CardTitle>Dewpoint ({{ format(preferences.temp) }})</CardTitle>
        <CardContent class="mx-0 px-0">
          <apexchart :options="getLineOptions((v) => ' ' + nf.format(v) + toAbbreviation(preferences.temp))" :series="dewpointSeries"
                     height="300"
                     type="line"/>
        </CardContent>
      </Card>

      <!--  Temperature chart -->
      <Card class="p-2 m-1">
        <CardTitle>Temperature ({{ format(preferences.temp) }})</CardTitle>
        <CardContent class="mx-0 px-0">

          <apexchart :options="getLineOptions((v) => ' ' + nf.format(v) + toAbbreviation(preferences.temp))" :series="temperatureSeries"
                     height="300"
                     type="line"/>
        </CardContent>
      </Card>

      <!--  Relative Humidity chart -->
      <Card class="p-2 m-1">
        <CardTitle>Relative Humidity</CardTitle>
        <CardContent class="mx-0 px-0">

          <apexchart :options="getLineOptions((v) => ' ' + nf.format(v) + '%')" :series="humiditySeries"
                     height="300"
                     type="line"/>
        </CardContent>
      </Card>

      <!--  Barometric Pressure chart -->
      <Card class="p-2 m-1">
        <CardTitle>Barometric Pressure ({{ format(preferences.pressure) }})</CardTitle>
        <CardContent class="mx-0 px-0">

          <apexchart :options="getLineOptions((v) => ' ' + nf.format(v))" :series="bpSeries"
                     height="300"
                     type="line"/>
        </CardContent>
      </Card>

      <!--  Solar Radiation chart -->
      <Card class="p-2 m-1">
        <CardTitle>Solar Radiation ({{ format(preferences.power) }})</CardTitle>
        <CardContent class="mx-0 px-0">

          <apexchart :options="getLineOptions((v) => ' ' + nf.format(v) + toAbbreviation(preferences.power))" :series="solarSeries"
                     height="300"
                     type="line"/>
        </CardContent>
      </Card>

      <!--  UV Index chart -->
      <Card class="p-2 m-1">
        <CardTitle>Ultraviolet Index</CardTitle>
        <CardContent class="mx-0 px-0">

          <apexchart :options="getLineOptions((v) => ' ' + nf.format(v))" :series="uvSeries"
                     height="300"
                     type="line"/>
        </CardContent>
      </Card>

      <!--  Rainfall chart -->
      <Card class="p-2 m-1">
        <CardTitle>Rainfall ({{ format(preferences.distance) }})</CardTitle>
        <CardContent class="mx-0 px-0">

          <apexchart :options="getLineOptions((v) => ' ' + nf.format(v) + toAbbreviation(preferences.distance))" :series="rainSeries"
                     height="300"
                     type="line"/>
        </CardContent>
      </Card>

      <!--  Windspeed chart -->
      <Card class="p-2 m-1">
        <CardTitle>Wind Speed ({{ format(preferences.speed) }})</CardTitle>
        <CardContent class="mx-0 px-0">

          <apexchart :options="getLineOptions((v) => ' ' + nf.format(v) + toAbbreviation(preferences.speed))" :series="windSeries"
                     height="300"
                     type="line"/>
        </CardContent>
      </Card>

      <!--  Battery Levels chart -->
      <Card class="p-2 m-1">
        <CardTitle>Battery Levels</CardTitle>
        <CardContent class="mx-0 px-0">
          <apexchart :options="getLineOptions((v) => ' ' + nf.format(v) + '%')" :series="batterySeries"
                     height="300"
                     type="line"/>
        </CardContent>
      </Card>
    </div>
  </article>
</template>
