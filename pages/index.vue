<script lang="ts" setup>
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from '@/components/ui/card'
import {
  calculateDewPoint,
  convertPressure,
  convertTemperature,
  getUVIndex,
  toAbbreviation,
  type WeatherApiResponse
} from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select";
import {Progress} from "~/components/ui/progress";
import useUserPrefs from "~/composables/useUserPrefs";

const {data, status} = useFetch<WeatherApiResponse>('http://localhost:3000/api/v1/latest');
const {preferences} = useUserPrefs()

const tempIn = data.value?.tempinf ?? 0;
const humidityIn = data.value?.humidityin ?? 0;
const temp = data.value?.tempf ?? 0;
const humidity = data.value?.humidity ?? 0;
const dewpointIn = calculateDewPoint(tempIn, preferences.value.temp, humidityIn);
const dewpoint = calculateDewPoint(temp, preferences.value.temp, humidity);
const windAngle = ref<number>(data.value?.winddir ?? 0);
const uv = data.value?.uv ?? 0;
const solarIntensity = data.value?.solarradiation ?? 0;
const baromRel = data.value?.baromrelin ?? 0;
const baromAbs = data.value?.baromabsin ?? 0;
const inside_bat = data.value?.batt_co2 ?? 1;
const outside_bad = data.value?.battout ?? 1;
let rerenderKey = 0;

const rainfallMap = new Map<string, number>();
rainfallMap.set('hourly-rain', data.value?.hourlyrainin ?? 0);
rainfallMap.set('daily-rain', data.value?.dailyrainin ?? 0);
rainfallMap.set('weekly-rain', data.value?.weeklyrainin ?? 0);
rainfallMap.set('monthly-rain', data.value?.monthlyrainin ?? 0);
rainfallMap.set('total-rain', data.value?.totalrainin ?? 0);

const windMap = new Map<string, number>();
windMap.set('wind-speed', data.value?.windspeedmph ?? 0);
windMap.set('gust-speed', data.value?.windgustmph ?? 0);
windMap.set('max-gust', data.value?.maxdailygust ?? 0);

const rainfall = ref<string>('hourly-rain');
const wind = ref<string>('wind-speed');

</script>

<template>
  <h1 class="text-5xl text-center m-6"> Current Weather </h1>

  <div v-if="status === 'success'">
    <div class="flex text-center m-6">
      <Card class="m-3 p-6 w-full">
        <CardTitle>Air Properties</CardTitle>
        <CardDescription>Tempertature, Relative Humidity, and Dewpoint.</CardDescription>
        <CardContent class="mt-8">
          <h1 class="font-semibold text-2xl">Inside</h1>
          <hr>
          <div class="grid grid-cols-3 self-center gap-8 mt-4 ">
            <Card class="w-auto h-40 p-2">
              <CardTitle class="m-1">
                Temperature
              </CardTitle>
              <CardContent class="text-6xl mt-4">
                {{ convertTemperature(tempIn, preferences.temp) }}{{toAbbreviation(preferences.temp)}}
              </CardContent>
            </Card>
            <Card class="w-auto h-40 p-2">
              <CardTitle class="m-1">
                Relative Humidity
              </CardTitle>
              <CardContent class="text-6xl mt-4">
                {{ humidityIn }}%
              </CardContent>
            </Card>
            <Card class="w-auto h-40 p-2">
              <CardTitle class="m-1">
                Dewpoint
              </CardTitle>
              <CardContent class="text-6xl mt-4">
                {{ dewpointIn }}{{toAbbreviation(preferences.temp)}}
              </CardContent>
            </Card>
          </div>
          <!--             Exterrior   -->
          <h1 class="font-semibold text-2xl mt-5">Outside</h1>
          <hr>
          <div class="grid grid-cols-3 self-center gap-8 mt-4 ">
            <Card class="w-auto h-40 p-2">
              <CardTitle class="m-1">
                Temperature
              </CardTitle>
              <CardContent class="text-6xl mt-4">
                {{  convertTemperature(temp, preferences.temp) }}{{toAbbreviation(preferences.temp)}}
              </CardContent>
            </Card>
            <Card class="w-auto h-40 p-2">
              <CardTitle class="m-1">
                Relative Humidity
              </CardTitle>
              <CardContent class="text-6xl mt-4">
                {{ humidity }}%
              </CardContent>
            </Card>
            <Card class="w-auto h-40 p-2">
              <CardTitle class="m-1">
                Dewpoint
              </CardTitle>
              <CardContent class="text-6xl mt-4">
                {{ dewpoint }}{{toAbbreviation(preferences.temp)}}
              </CardContent>
            </Card>
          </div>

        </CardContent>
      </Card>
    </div>

    <div class="flex m-6">
      <Card class="m-3 p-6 w-full text-center">
        <CardTitle>Environment Properties</CardTitle>
        <CardDescription>Pressure, Rainfall, Light, and Wind.</CardDescription>
        <CardContent class="mt-4 grid grid-cols-2 gap-8">
          <!-- Rainfall -->
          <Card class="w-full mx-3">
            <CardTitle class="mt-3">Rainfall</CardTitle>
            <CardHeader class="flex items-center mt-[-15px]">
              <Select v-model="rainfall" default-value="hourly-rain" required>
                <SelectTrigger class="w-[180px]">
                  <SelectValue placeholder="Select a period"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Rainfall Periods</SelectLabel>
                    <SelectItem value="hourly-rain">
                      Hourly
                    </SelectItem>
                    <SelectItem value="daily-rain">
                      Daily
                    </SelectItem>
                    <SelectItem value="weekly-rain">
                      Weekly
                    </SelectItem>
                    <SelectItem value="monthly-rain">
                      Monthly
                    </SelectItem>
                    <SelectItem value="total-rain">
                      All Time
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <CardContent class="mt-5">
              <span class="text-5xl relative">
                {{ rainfallMap.get(rainfall) }} {{toAbbreviation(preferences.distance)}}
              </span>
              </CardContent>
            </CardHeader>
          </Card>

          <!-- Wind -->
          <Card class=" w-full mx-3">
            <CardTitle class="mt-3">Wind</CardTitle>
            <CardHeader class="flex items-center mt-[-15px]">
              <Select v-model="wind" default-value="wind-speed">
                <SelectTrigger class="w-[180px]">
                  <SelectValue placeholder="Select a period"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Wind Speeds</SelectLabel>
                    <SelectItem value="wind-speed">
                      Wind Speed
                    </SelectItem>
                    <SelectItem value="gust-speed">
                      Gust Speed
                    </SelectItem>
                    <SelectItem value="max-gust">
                      Max Gust Speed
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent class="flex items-center justify-center">
              <ClientOnly>
                <template #fallback>
                  <Skeleton class="h-28 w-28 rounded-full" />
                </template>
                <WindDirection :angle="windAngle" :rerender="rerenderKey" :speed="windMap.get(wind).toFixed(1)"/>
              </ClientOnly>
            </CardContent>
          </Card>

          <!-- Light -->
          <Card class=" w-full mx-3">
            <CardTitle class="mt-3">Light</CardTitle>

            <CardContent>
              <div class="grid grid-cols-2 gap-4 mt-3">
                <Card>
                  <CardTitle class="text-xl font-normal">
                    UV Index
                  </CardTitle>
                  <CardContent>
                    {{ uv }} - {{ getUVIndex(uv) }}
                  </CardContent>
                </Card>
                <Card>
                  <CardTitle class="text-xl font-normal">
                    Solar Radiation
                  </CardTitle>
                  <CardContent>
                    {{ solarIntensity }} {{toAbbreviation(preferences.power)}}
                  </CardContent>
                </Card>

              </div>
            </CardContent>
          </Card>

          <!-- Barometric Pressure -->
          <Card class=" w-full mx-3">
            <CardTitle class="mt-3">Barometric Pressure</CardTitle>

            <CardContent>
              <div class="grid grid-cols-2 gap-4 mt-3">
                <Card>
                  <CardTitle class="text-xl font-normal">
                    Absolute
                  </CardTitle>
                  <CardContent>
                    {{ convertPressure(baromAbs, preferences.pressure) }} <span class="font-light text-sm italic">{{toAbbreviation(preferences.pressure)}}</span>
                  </CardContent>
                </Card>
                <Card>
                  <CardTitle class="text-xl font-normal">
                    Relative
                  </CardTitle>
                  <CardContent>
                    {{ convertPressure(baromRel, preferences.pressure) }} <span class="font-light text-sm italic">{{toAbbreviation(preferences.pressure)}}</span>
                  </CardContent>
                </Card>

              </div>
            </CardContent>
          </Card>

          <!--Device Battery Levels-->
          <Card class="col-span-full w-full mx-3">
            <CardTitle class="mt-3">Device Battery Levels</CardTitle>

            <CardContent class="flex flex-col">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Label for="sensor_array">Sensor Array</Label>
                    <Progress id="sensor_array" :model-value="outside_bad * 100"/>
                  </TooltipTrigger>
                  <TooltipContent align="center" side="bottom">
                    {{ outside_bad * 100 }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Label for="base_station">Base Station</Label>
                    <Progress id="base_station" :model-value="inside_bat * 100"/>
                  </TooltipTrigger>
                  <TooltipContent align="center" side="bottom">
                    {{ inside_bat * 100 }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  </div>

  <div v-else>
    <div class="flex text-center m-6">
      <Card class="m-3 p-6 w-full">
        <CardTitle>Air Properties</CardTitle>
        <CardDescription>Tempertature, Relative Humidity, and Dewpoint.</CardDescription>
        <CardContent class="mt-8">
          <h1 class="font-semibold text-2xl">Inside</h1>
          <hr>
          <div class="grid grid-cols-3 self-center gap-8 mt-4 ">
            <Skeleton class="w-auto h-40 p-2"/>
            <Skeleton class="w-auto h-40 p-2"/>
            <Skeleton class="w-auto h-40 p-2"/>
          </div>
          <!--             Exterrior   -->
          <h1 class="font-semibold text-2xl mt-5">Outside</h1>
          <hr>
          <div class="grid grid-cols-3 self-center gap-8 mt-4 ">
            <Skeleton class="w-auto h-40 p-2"/>
            <Skeleton class="w-auto h-40 p-2"/>
            <Skeleton class="w-auto h-40 p-2"/>
          </div>

        </CardContent>
      </Card>
    </div>

    <div class="flex m-6">
      <Card class="m-3 p-6 w-full text-center">
        <CardTitle>Environment Properties</CardTitle>
        <CardDescription>Pressure, Rainfall, Light, and Wind.</CardDescription>
        <CardContent class="mt-4 grid grid-cols-2 gap-8">

          <!-- Rainfall -->
          <Card class="w-full mx-3">
            <CardTitle class="mt-3">Rainfall</CardTitle>
            <CardHeader class="flex items-center mt-[-15px]">
              <Skeleton class="w-44 h-10"/>
              <CardContent class="mt-5">
                <Skeleton class="h-28 w-28"/>
              </CardContent>
            </CardHeader>
          </Card>

          <!-- Wind -->
          <Card class=" w-full mx-3">
            <CardTitle class="mt-3">Wind</CardTitle>
            <CardHeader class="flex items-center mt-[-15px]">
              <Skeleton class="w-44 h-10"/>
              <CardContent class="mt-5">
                <Skeleton class="h-28 w-28"/>
              </CardContent>
            </CardHeader>
          </Card>

          <!-- Light -->
          <Card class=" w-full mx-3">
            <CardTitle class="mt-3">Light</CardTitle>

            <CardContent>
              <div class="grid grid-cols-2 gap-4 mt-3">
                <Skeleton class="h-24"/>
                <Skeleton class="h-24"/>
              </div>
            </CardContent>
          </Card>

          <!-- Barometric Pressure -->
          <Card class=" w-full mx-3">
            <CardTitle class="mt-3">Barometric Pressure</CardTitle>

            <CardContent>
              <div class="grid grid-cols-2 gap-4 mt-3">
                <Skeleton class="h-24"/>
                <Skeleton class="h-24"/>
              </div>
            </CardContent>
          </Card>

          <!--Device Battery Levels-->
          <Card class="col-span-full w-full mx-3">
            <CardTitle class="mt-3">Device Battery Levels</CardTitle>
            <CardContent class="flex flex-col">
              <Skeleton class="h-4 mt-2"/>
              <Skeleton class="h-4 mt-2"/>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
