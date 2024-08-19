<script lang="ts" setup>

import {LineChart} from "~/components/ui/chart-line";
import {DateFormatter, getLocalTimeZone, today} from "@internationalized/date";
import {RangeCalendar} from '@/components/ui/range-calendar'
import {Button} from '@/components/ui/button'
import useUserPrefs from "~/composables/useUserPrefs";
import type {DateRange} from "radix-vue";
import {ref, type Ref} from "vue";
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

const df = new DateFormatter('en-US', {
  dateStyle: 'medium',
})

const datetimeFormatter = new DateFormatter('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: getLocalTimeZone()
})

const dateRange = ref({
  start: today(getLocalTimeZone()),
  end: today(getLocalTimeZone()).add({days: 1}),
}) as Ref<DateRange>

const {preferences} = useUserPrefs()


watch(dateRange, (newValue) => {
  start_date.value = newValue.start?.toDate(getLocalTimeZone()).toISOString() ?? new Date().toISOString();
  end_date.value = newValue.end?.toDate(getLocalTimeZone()).toISOString() ?? new Date().toISOString();

  if ((start_date.value && end_date.value) && (start_date.value !== '' && end_date.value !== '')) {
    refresh()
  } else {
    console.log("Not refreshing")
  }
});

const start_date = ref<string>(today(getLocalTimeZone()).toDate(getLocalTimeZone()).toISOString())
const end_date = ref<string>(new Date().toISOString())


const {data, status, error, refresh} = useFetch<WeatherApiResponse[]>('https://weather-api.foxikle.dev/api/v1/range', {
  query: {
    start_date,
    end_date
  }
});

const dewpoint = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Inside: calculateDewPoint(item.tempinf, preferences.value.temp, item.humidityin),
      Outside: calculateDewPoint(item.tempf, preferences.value.temp, item.humidity)
    }));
  }
  return [];
})

const temperature = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Inside: convertTemperature(item.tempinf, preferences.value.temp),
      Outside: convertTemperature(item.tempf, preferences.value.temp),
    }));
  }
  return [];
})

const humidity = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Inside: item.humidityin,
      Outside: item.humidity
    }));
  }
  return [];
})

// Light Tempurature
const uv = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Outside: item.uv, // not converted
    }));
  }
  return [];
})

const solar = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Outside: convertPower(item.solarradiation, preferences.value.power),
    }));
  }
  return [];
})

const bp = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Absolute: convertPressure(item.baromabsin, preferences.value.pressure),
      Relative: convertPressure(item.baromrelin, preferences.value.pressure),
    }));
  }
  return [];
})

const rain = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Hourly: convertDistance(item.hourlyrainin, preferences.value.distance),
      Daily: convertDistance(item.dailyrainin, preferences.value.distance),
      Weekly: convertDistance(item.weeklyrainin, preferences.value.distance),
      Monthly: convertDistance(item.dailyrainin, preferences.value.distance),
      Total: convertDistance(item.totalrainin, preferences.value.distance),
    }));
  }
  return [];
})

const wind = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Wind: convertSpeed(item.windspeedmph, preferences.value.speed),
      Gust: convertSpeed(item.windgustmph, preferences.value.speed),
      Max_Gust: convertSpeed(item.maxdailygust, preferences.value.speed),
    }));
  }
  return [];
})

const battery = computed(() => {
  if (data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Base: item.batt_co2 * 100,
      Sensor: item.battout * 100,
    }));
  }
  return [];
})

function format(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).replaceAll("_", " ");
}


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
                         @update:start-value="(startDate) => dateRange.start = startDate"/>
        </PopoverContent>
      </Popover>
    </div>
    <div class="grid-cols-1 xl:grid-cols-2 grid gap-2">
      <!--  Dewpoint chart -->
      <Card class="p-2 m-1">
        <CardTitle>Dewpoint ({{ format(preferences.temp) }})</CardTitle>
        <CardContent class="mx-0 px-0">
          <LineChart :categories="['Inside', 'Outside']" :data="dewpoint"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString() + toAbbreviation(preferences.temp)}`
        : ''
  }"
                     index="datetime"/>
        </CardContent>
      </Card>

      <!--  Temperature chart -->
      <Card class="p-2 m-1">
        <CardTitle>Temperature ({{ format(preferences.temp) }})</CardTitle>
        <CardContent class="mx-0 px-0">

          <LineChart :categories="['Inside', 'Outside']" :data="temperature"
                     :y-formatter="(tick, i) => {

    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString() + toAbbreviation(preferences.temp)}`
        : ''
  }"
                     index="datetime"/>
        </CardContent>
      </Card>

      <!--  Relative Humidity chart -->
      <Card class="p-2 m-1">
        <CardTitle>Relative Humidity</CardTitle>
        <CardContent class="mx-0 px-0">

          <LineChart :categories="['Inside', 'Outside']" :data="humidity"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString()}%`
        : ''
  }"
                     index="datetime"/>
        </CardContent>
      </Card>

      <!--  UV Index chart -->
      <Card class="p-2 m-1">
        <CardTitle>Ultraviolet Index</CardTitle>
        <CardContent class="mx-0 px-0">

          <LineChart :categories="['Outside']" :data="uv"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString()}`
        : ''
  }"
                     index="datetime"/>
        </CardContent>
      </Card>

      <!--  Solar Radiation chart -->
      <Card class="p-2 m-1">
        <CardTitle>Solar Radiation ({{ format(preferences.power) }})</CardTitle>
        <CardContent class="mx-0 px-0">

          <LineChart :categories="['Outside']" :data="solar"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString() + toAbbreviation(preferences.power)}`
        : ''
  }"
                     index="datetime"/>
        </CardContent>
      </Card>

      <!--  Barometric Pressure chart -->
      <Card class="p-2 m-1">
        <CardTitle>Barometric Pressure ({{ format(preferences.pressure) }})</CardTitle>
        <CardContent class="mx-0 px-0">

          <LineChart :categories="['Absolute', 'Relative']" :data="bp"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString()}`
        : ''
  }"
                     index="datetime"/>
        </CardContent>
      </Card>

      <!--  Rainfall chart -->
      <Card class="p-2 m-1">
        <CardTitle>Rainfall ({{ format(preferences.distance) }})</CardTitle>
        <CardContent class="mx-0 px-0">

          <LineChart :categories="['Hourly', 'Daily', 'Weekly', 'Monthly']" :data="rain"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString() + toAbbreviation(preferences.distance)}`
        : ''
  }"
                     index="datetime"/>
        </CardContent>
      </Card>

      <!--  Windspeed chart -->
      <Card class="p-2 m-1">
        <CardTitle>Wind Speed ({{ format(preferences.speed) }})</CardTitle>
        <CardContent class="mx-0 px-0">

          <LineChart :categories="['Wind', 'Gust', 'Max_Gust']" :data="wind"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString() + toAbbreviation(preferences.speed)}`
        : ''
  }"
                     index="datetime"/>
        </CardContent>
      </Card>

      <!--  Battery Levels chart -->
      <Card class="p-2 m-1">
        <CardTitle>Batery Levels</CardTitle>
        <CardContent class="mx-0 px-0">
          <LineChart :categories="['Base', 'Sensor']" :data="battery"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString()}%`
        : ''
  }"
                     index="datetime"/>
        </CardContent>
      </Card>
    </div>
  </article>
</template>

<style scoped>

</style>