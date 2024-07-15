<script lang="ts" setup>

import {LineChart} from "~/components/ui/chart-line";
import {CalendarDate, DateFormatter, getLocalTimeZone, today} from "@internationalized/date";
import {RangeCalendar} from '@/components/ui/range-calendar'
import {Button} from '@/components/ui/button'

import type {DateRange} from "radix-vue";
import {ref, type Ref} from "vue";
import {calculateDewPoint, cn, type WeatherApiResponse} from "~/lib/utils";
import {Popover, PopoverTrigger, PopoverContent} from "~/components/ui/popover";
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

watch(dateRange, (newValue) => {
  start_date.value = newValue.start?.toDate(getLocalTimeZone()).toISOString() ?? new Date().toISOString();
  end_date.value = newValue.end?.toDate(getLocalTimeZone()).toISOString() ?? new Date().toISOString();

  if((start_date.value && end_date.value) && (start_date.value !== '' && end_date.value !== '')){
    refresh()
  } else {
    console.log("Not refreshing")
  }
});

const start_date = ref<string>(today(getLocalTimeZone()).toDate(getLocalTimeZone()).toISOString())
const end_date = ref<string>(new Date().toISOString())


const {data, status, error, refresh} = useFetch<WeatherApiResponse[]>('http://localhost:3000/api/v1/range', {
  query: {
    start_date,
    end_date
  }
});

const dewpoint = computed(() => {
  if(data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Inside: calculateDewPoint(item.tempinf, item.humidityin, true),
      Outside: calculateDewPoint(item.tempf, item.humidity, true)
    }));
  }
  return [];
})

const temperature = computed(() => {
  if(data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Inside: item.tempinf,
      Outside: item.tempf,
    }));
  }
  return [];
})

const humidity = computed(() => {
  if(data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Inside:  item.humidityin,
      Outside: item.humidity
    }));
  }
  return [];
})

// Light Tempurature
const uv = computed(() => {
  if(data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Outside:  item.uv,
    }));
  }
  return [];
})

const solar = computed(() => {
  if(data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Outside:  item.solarradiation,
    }));
  }
  return [];
})

const bp = computed(() => {
  if(data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Absolute:  item.baromabsin,
      Relative:  item.baromrelin,
    }));
  }
  return [];
})

const rain = computed(() => {
  if(data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Hourly:  item.hourlyrainin,
      Daily:  item.dailyrainin,
      Weekly:  item.weeklyrainin,
      Monthly:  item.dailyrainin,
      Total:  item.totalrainin,
    }));
  }
  return [];
})

const wind = computed(() => {
  if(data.value && data.value.length > 0) {
    return data.value.map(item => ({
      datetime: datetimeFormatter.format(new Date(item.dateutc)),
      Wind:  item.windspeedmph,
      Gust:  item.windgustmph,
      Max_Gust:  item.maxdailygust,
    }));
  }
  return [];
})

</script>

<template>
  <article class="px-5 mx-5">
    <h1 v-if="error"> ERROR: {{ error }}</h1>
    <!--  Range Picker -->
    <div class="flex items-center flex-col m-2">
      <Popover class="self-center">
        <PopoverTrigger as-child>
          <Button
              variant="outline"
              :class="cn(
          'w-[280px] justify-start text-left font-normal',
          !dateRange && 'text-muted-foreground',
        )"
          >
            <Icon icon="mdi:calendar" class="mr-2 h-4 w-4" />
            <template v-if="dateRange.start">
              <template v-if="dateRange.end">
                {{ df.format(dateRange.start.toDate(getLocalTimeZone())) }} - {{ df.format(dateRange.end.toDate(getLocalTimeZone())) }}
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
          <RangeCalendar v-model="dateRange" initial-focus :number-of-months="1" @update:start-value="(startDate) => dateRange.start = startDate" />
        </PopoverContent>
      </Popover>
    </div>
    <div class="grid-cols-1 xl:grid-cols-2 grid gap-2">
      <!--  Dewpoint chart -->
      <Card class="p-2 m-1">
        <CardTitle>Dewpoint</CardTitle>
        <CardContent>
          <LineChart :data="dewpoint" index="datetime"
                     :categories="['Inside', 'Outside']"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString()}°F`
        : ''
  }"/>
        </CardContent>
      </Card>

      <!--  Temperature chart -->
      <Card class="p-2 m-1">
        <CardTitle>Temperature</CardTitle>
        <CardContent>
          <LineChart :data="temperature" index="datetime"
                     :categories="['Inside', 'Outside']"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString()}°F`
        : ''
  }"/>
        </CardContent>
      </Card>

      <!--  Relative Humidity chart -->
      <Card class="p-2 m-1">
        <CardTitle>Relative Humidity</CardTitle>
        <CardContent>
          <LineChart :data="humidity" index="datetime"
                     :categories="['Inside', 'Outside']"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString()}%`
        : ''
  }"/>
        </CardContent>
      </Card>

      <!--  UV Index chart -->
      <Card class="p-2 m-1">
        <CardTitle>Ultraviolet Index</CardTitle>
        <CardContent>
          <LineChart :data="uv" index="datetime"
                     :categories="['Outside']"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString()}`
        : ''
  }"/>
        </CardContent>
      </Card>

      <!--  Solar Radiation chart -->
      <Card class="p-2 m-1">
        <CardTitle>Solar Radiation</CardTitle>
        <CardContent>
          <LineChart :data="solar" index="datetime"
                     :categories="['Outside']"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString()}`
        : ''
  }"/>
        </CardContent>
      </Card>

      <!--  Barometric Pressure chart -->
      <Card class="p-2 m-1">
        <CardTitle>Barometric Pressure</CardTitle>
        <CardContent>
          <LineChart :data="bp" index="datetime"
                     :categories="['Absolute', 'Relative']"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString()}`
        : ''
  }"/>
        </CardContent>
      </Card>

      <!--  Rainfall chart -->
      <Card class="p-2 m-1">
        <CardTitle>Rainfall</CardTitle>
        <CardContent>
          <LineChart :data="rain" index="datetime"
                     :categories="['Hourly', 'Daily', 'Weekly', 'Monthly']"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString()}in`
        : ''
  }"/>
        </CardContent>
      </Card>

      <!--  Windspeed chart -->
      <Card class="p-2 m-1">
        <CardTitle>Wind Speed</CardTitle>
        <CardContent>
          <LineChart :data="wind" index="datetime"
                     :categories="['Wind', 'Gust', 'Max_Gust']"
                     :y-formatter="(tick, i) => {
    return typeof tick === 'number'
        ? ` ${new Intl.NumberFormat('us').format(tick).toString()}mph`
        : ''
  }"/>
        </CardContent>
      </Card>

    </div>
  </article>
</template>

<style scoped>

</style>