<script lang="ts" setup>

import {NavigationMenu, navigationMenuTriggerStyle} from "~/components/ui/navigation-menu";
import {Icon} from "@iconify/vue";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "~/components/ui/dropdown-menu";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "~/components/ui/sheet";
import {toTypedSchema} from "@vee-validate/zod";
import {z} from "zod";
import {useForm} from "vee-validate";
import {
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {useToast} from "~/components/ui/toast";
import useUserPrefs from "~/composables/useUserPrefs";


const {preferences, loadPreferences, savePreferences, loading, error} = useUserPrefs()
const colorMode = useColorMode()

const formSchema = toTypedSchema(z.object({
  temp: z.string(),
  distance: z.string(),
  angle: z.string(),
  power: z.string(),
  pressure: z.string(),
  speed: z.string()
}))

const {handleSubmit} = useForm({
  validationSchema: formSchema,
})
const {toast} = useToast();

const onSubmit = handleSubmit(values => {
  savePreferences(values)
  toast({
    title: 'Successfully updated your preferences!'
  });
  reloadNuxtApp({
    persistState: true,
  })
})

</script>

<template>
  <Toaster/>
  <h1 v-if="error"> {{ error }}</h1>
  <Card class="flex flex-row justify-between mx-1">
    <NavigationMenu class="list-none">
      <NavigationMenuItem>
        <NuxtLink to="/">
          <NavigationMenuLink :class="navigationMenuTriggerStyle()">
            Home
          </NavigationMenuLink>
        </NuxtLink>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NuxtLink to="/history">
          <NavigationMenuLink :class="navigationMenuTriggerStyle()">
            History
          </NavigationMenuLink>
        </NuxtLink>
      </NavigationMenuItem>
    </NavigationMenu>
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost">
            <Icon class="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                  icon="radix-icons:moon"/>
            <Icon
                class="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                icon="radix-icons:sun"/>
            <span class="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="colorMode.preference = 'light'">
            Light
          </DropdownMenuItem>
          <DropdownMenuItem @click="colorMode.preference = 'dark'">
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem @click="colorMode.preference = 'system'">
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button as-child variant="ghost">
        <NuxtLink no-prefetch no-rel target="_blank" to="https://github.com/foxikle/weather-app">
          <Icon class="h-5 w-5" icon="mdi:github"/>
        </NuxtLink>
      </Button>
      <Sheet>
        <SheetTrigger as-child>
          <Button as-child variant="ghost" @click="loadPreferences">
            <div>
              <Icon class="h-5 w-5" icon="mdi:gear"/>
            </div>
          </Button>
        </SheetTrigger>

        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Preferences</SheetTitle>
            <SheetDescription>
              Make changes to your preferences here. Click save when you're done :)
            </SheetDescription>
          </SheetHeader>

          <div class="mt-4 font-semibold text-lg">
            <form @submit="onSubmit">
              <h1>Units</h1>
              <FormField v-slot="{ componentField }" :model-value="preferences.temp" name="temp">
                <FormItem>
                  <Label for="temp">Temperature</Label>
                  <Select id="temp" :default-value="preferences.temp" v-bind="componentField">
                    <FormControl>
                      <SelectTrigger class="w-[180px]">
                        <SelectValue placeholder="Select a unit"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Temperature Units</SelectLabel>
                        <SelectItem value="celsius">
                          Celsius
                        </SelectItem>
                        <SelectItem value="fahrenheit">
                          Fahrenheit
                        </SelectItem>
                        <SelectItem value="kelvin">
                          Kelvin
                        </SelectItem>
                        <SelectItem value="rankine">
                          Rankine
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" :model-value="preferences.distance" name="distance">
                <FormItem>
                  <Label for="distance">Distance</Label>
                  <Select id="distance" :default-value="preferences.distance" v-bind="componentField">
                    <FormControl>
                      <SelectTrigger class="w-[180px]">
                        <SelectValue placeholder="Select a unit"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Length Units</SelectLabel>
                        <SelectItem value="inches">
                          Inches
                        </SelectItem>
                        <SelectItem value="meters">
                          Meters
                        </SelectItem>
                        <SelectItem value="miles">
                          Miles
                        </SelectItem>
                        <SelectItem value="millimeters">
                          Millimeters
                        </SelectItem>
                        <SelectItem value="centimeters">
                          Centimeters
                        </SelectItem>
                        <SelectItem value="furlongs">
                          Furlongs
                        </SelectItem>
                        <SelectItem value="rods">
                          Rods
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" :model-value="preferences.speed" name="speed">
                <FormItem>
                  <Label for="speed">Speed</Label>
                  <Select id="speed" :default-value="preferences.speed" v-bind="componentField">
                    <FormControl>
                      <SelectTrigger class="w-[180px]">
                        <SelectValue placeholder="Select a unit"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Speed Units</SelectLabel>
                        <SelectItem value="miles_per_hour">
                          Miles/Hr
                        </SelectItem>
                        <SelectItem value="feet_per_minute">
                          Feet/Min
                        </SelectItem>
                        <SelectItem value="feet_per_second">
                          Feet/Sec
                        </SelectItem>
                        <SelectItem value="kilometers_per_hour">
                          Kilometers/Hr
                        </SelectItem>
                        <SelectItem value="meters_per_minute">
                          Meters/Min
                        </SelectItem>
                        <SelectItem value="meters_per_second">
                          Meters/Sec
                        </SelectItem>
                        <SelectItem value="furlongs_per_fortnight">
                          Furlongs/Fortnight
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" :model-value="preferences.pressure" name="pressure">
                <FormItem>
                  <Label for="pressure">Pressure</Label>
                  <Select id="pressure" :default-value="preferences.pressure" v-bind="componentField">
                    <FormControl>
                      <SelectTrigger class="w-[180px]">
                        <SelectValue placeholder="Select a unit"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pressure Units</SelectLabel>
                        <SelectItem value="inches_of_mercury">
                          Inches of Mercury
                        </SelectItem>
                        <SelectItem value="millimeters_of_mercury">
                          Millimeters of Mercury
                        </SelectItem>
                        <SelectItem value="pounds_per_square_inch">
                          Pounds per Square Inch
                        </SelectItem>
                        <SelectItem value="pascals">
                          Pascals
                        </SelectItem>
                        <SelectItem value="kilopascals">
                          Kilopascals
                        </SelectItem>
                        <SelectItem value="atmospheres">
                          Atmospheres
                        </SelectItem>
                        <SelectItem value="bar">
                          Bar
                        </SelectItem>
                        <SelectItem value="torr">
                          Torr
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" :model-value="preferences.angle" name="angle">
                <FormItem>
                  <Label for="angle">Angle</Label>
                  <Select id="angle" :default-value="preferences.angle" v-bind="componentField">
                    <FormControl>
                      <SelectTrigger class="w-[180px]">
                        <SelectValue placeholder="Select a unit"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Angle Measure Units</SelectLabel>
                        <SelectItem value="radians">
                          Radians
                        </SelectItem>
                        <SelectItem value="degrees">
                          Degrees
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" :model-value="preferences.power" name="power">
                <FormItem>
                  <Label for="power">Power</Label>
                  <Select id="power" :default-value="preferences.power" v-bind="componentField">
                    <FormControl>
                      <SelectTrigger class="w-[180px]">
                        <SelectValue placeholder="Select a unit"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Power Units</SelectLabel>
                        <SelectItem value="horsepower">
                          Horsepower
                        </SelectItem>
                        <SelectItem value="watt">
                          Watt
                        </SelectItem>
                        <SelectItem value="calories_per_second">
                          Calories per Second
                        </SelectItem>
                        <SelectItem value="btu_per_hr">
                          BTU/Hr
                        </SelectItem>
                        <SelectItem value="decibel_milliwatts">
                          Decibel-Miliwatts
                        </SelectItem>
                        <SelectItem value="megawatts">
                          Megawatts
                        </SelectItem>
                        <SelectItem value="kilowatts">
                          Kilowatts
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              </FormField>

              <Button class="mt-3" type="submit" variant="secondary">
                Update Preferences
              </Button>
            </form>
            <h1>Data Fetching</h1>


          </div>
        </SheetContent>
      </Sheet>
    </div>
  </Card>
</template>

<style scoped>

</style>