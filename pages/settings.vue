<script lang="ts" setup>
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '~/components/ui/card'
import {Button} from '~/components/ui/button'
import {Input} from '~/components/ui/input'
import {Label} from '~/components/ui/label'
import {Switch} from '~/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import {FormControl, FormDescription, FormField, FormItem, FormMessage} from '@/components/ui/form'
import {useToast} from '~/components/ui/toast'
import useUserPrefs from '~/composables/useUserPrefs'
import {toTypedSchema} from '@vee-validate/zod'
import {z} from 'zod'
import {useForm} from 'vee-validate'
import {Icon} from '@iconify/vue'

const {preferences, loadPreferences, savePreferences, loading, error} = useUserPrefs()
const {toast} = useToast()

// Load preferences on mount
onMounted(() => {
  loadPreferences()
})

const formSchema = toTypedSchema(z.object({
  temp: z.string(),
  distance: z.string(),
  angle: z.string(),
  power: z.string(),
  pressure: z.string(),
  speed: z.string(),
  segments: z.number().min(1).max(1000)
}))

const {handleSubmit, setValues} = useForm({
  validationSchema: formSchema,
})

// Update form values when preferences change
watch(() => preferences.value, (newPrefs) => {
  setValues({
    temp: newPrefs.temp,
    distance: newPrefs.distance,
    angle: newPrefs.angle,
    power: newPrefs.power,
    pressure: newPrefs.pressure,
    speed: newPrefs.speed,
    segments: newPrefs.segments
  })
}, {immediate: true})

const onSubmit = handleSubmit(values => {
  savePreferences(values)
  toast({
    title: 'Settings Updated',
    description: 'Your preferences have been saved successfully!'
  })
  // Navigate back or reload if needed
  navigateTo('/')
})

const resetToDefaults = () => {
  const defaults = {
    temp: 'fahrenheit',
    distance: 'inches',
    angle: 'degrees',
    power: 'watt',
    pressure: 'inches_of_mercury',
    speed: 'miles_per_hour',
    segments: 100,
  }
  savePreferences(defaults)
  toast({
    title: 'Settings Reset',
    description: 'All settings have been reset to defaults.'
  })
}

useServerSeoMeta({
  title: 'Settings',
  description: 'Configure your weather preferences and units',
})
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-4">
    <div class="mt-6 grid gap-6">
      <!-- Header -->
      <Card>
        <CardHeader class="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <CardTitle class="text-3xl md:text-4xl">Settings</CardTitle>
            <CardDescription>Configure your weather preferences and display units.</CardDescription>
          </div>
          <div class="flex gap-2 items-center justify-center md:justify-start">
            <Button variant="outline" @click="resetToDefaults">
              <Icon class="h-4 w-4 mr-2" icon="material-symbols:device-reset-rounded"/>
              Reset to Defaults
            </Button>
            <Button variant="outline" @click="navigateTo('/')">
              <Icon class="h-4 w-4 mr-2" icon="material-symbols:arrow-back"/>
              Back
            </Button>
          </div>
        </CardHeader>
      </Card>

      <!-- Error Display -->
      <Card v-if="error" class="border-destructive">
        <CardContent class="pt-6">
          <div class="flex items-center gap-2 text-destructive">
            <Icon class="h-5 w-5" icon="material-symbols:error"/>
            <span>{{ error }}</span>
          </div>
        </CardContent>
      </Card>

      <!-- Settings Form -->
      <form @submit="onSubmit">
        <div class="grid gap-6">
          <!-- Units Section -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Icon class="h-5 w-5" icon="material-symbols:straighten"/>
                Units
              </CardTitle>
              <CardDescription>Choose your preferred measurement units for weather data.</CardDescription>
            </CardHeader>
            <CardContent class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Temperature -->
              <FormField v-slot="{ componentField }" :model-value="preferences.temp" name="temp">
                <FormItem>
                  <Label for="temp">Temperature</Label>
                  <Select id="temp" :default-value="preferences.temp" v-bind="componentField">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Temperature Units</SelectLabel>
                        <SelectItem value="celsius">Celsius (°C)</SelectItem>
                        <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                        <SelectItem value="kelvin">Kelvin (K)</SelectItem>
                        <SelectItem value="rankine">Rankine (°R)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              </FormField>

              <!-- Distance -->
              <FormField v-slot="{ componentField }" :model-value="preferences.distance" name="distance">
                <FormItem>
                  <Label for="distance">Distance</Label>
                  <Select id="distance" :default-value="preferences.distance" v-bind="componentField">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Distance Units</SelectLabel>
                        <SelectItem value="inches">Inches (in)</SelectItem>
                        <SelectItem value="meters">Meters (m)</SelectItem>
                        <SelectItem value="miles">Miles (mi)</SelectItem>
                        <SelectItem value="millimeters">Millimeters (mm)</SelectItem>
                        <SelectItem value="centimeters">Centimeters (cm)</SelectItem>
                        <SelectItem value="furlongs">Furlongs (fur)</SelectItem>
                        <SelectItem value="rods">Rods (rd)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              </FormField>

              <!-- Speed -->
              <FormField v-slot="{ componentField }" :model-value="preferences.speed" name="speed">
                <FormItem>
                  <Label for="speed">Speed</Label>
                  <Select id="speed" :default-value="preferences.speed" v-bind="componentField">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Speed Units</SelectLabel>
                        <SelectItem value="miles_per_hour">Miles per Hour (mph)</SelectItem>
                        <SelectItem value="feet_per_minute">Feet per Minute (ft/min)</SelectItem>
                        <SelectItem value="feet_per_second">Feet per Second (ft/s)</SelectItem>
                        <SelectItem value="kilometers_per_hour">Kilometers per Hour (km/h)</SelectItem>
                        <SelectItem value="meters_per_minute">Meters per Minute (m/min)</SelectItem>
                        <SelectItem value="meters_per_second">Meters per Second (m/s)</SelectItem>
                        <SelectItem value="furlongs_per_fortnight">Furlongs per Fortnight</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              </FormField>

              <!-- Pressure -->
              <FormField v-slot="{ componentField }" :model-value="preferences.pressure" name="pressure">
                <FormItem>
                  <Label for="pressure">Pressure</Label>
                  <Select id="pressure" :default-value="preferences.pressure" v-bind="componentField">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pressure Units</SelectLabel>
                        <SelectItem value="inches_of_mercury">Inches of Mercury (inHg)</SelectItem>
                        <SelectItem value="millimeters_of_mercury">Millimeters of Mercury (mmHg)</SelectItem>
                        <SelectItem value="pounds_per_square_inch">Pounds per Square Inch (psi)</SelectItem>
                        <SelectItem value="pascals">Pascals (Pa)</SelectItem>
                        <SelectItem value="kilopascals">Kilopascals (kPa)</SelectItem>
                        <SelectItem value="atmospheres">Atmospheres (atm)</SelectItem>
                        <SelectItem value="bar">Bar</SelectItem>
                        <SelectItem value="torr">Torr</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              </FormField>

              <!-- Angle -->
              <FormField v-slot="{ componentField }" :model-value="preferences.angle" name="angle">
                <FormItem>
                  <Label for="angle">Angle</Label>
                  <Select id="angle" :default-value="preferences.angle" v-bind="componentField">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Angle Units</SelectLabel>
                        <SelectItem value="radians">Radians (rad)</SelectItem>
                        <SelectItem value="degrees">Degrees (°)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              </FormField>

              <!-- Power -->
              <FormField v-slot="{ componentField }" :model-value="preferences.power" name="power">
                <FormItem>
                  <Label for="power">Power</Label>
                  <Select id="power" :default-value="preferences.power" v-bind="componentField">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Power Units</SelectLabel>
                        <SelectItem value="horsepower">Horsepower (hp)</SelectItem>
                        <SelectItem value="watt">Watt (W)</SelectItem>
                        <SelectItem value="calories_per_second">Calories per Second (cal/s)</SelectItem>
                        <SelectItem value="btu_per_hr">BTU per Hour (BTU/hr)</SelectItem>
                        <SelectItem value="decibel_milliwatts">Decibel-Milliwatts (dBm)</SelectItem>
                        <SelectItem value="megawatts">Megawatts (MW)</SelectItem>
                        <SelectItem value="kilowatts">Kilowatts (kW)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormItem>
              </FormField>
            </CardContent>
          </Card>

          <!-- Data & Performance -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Icon class="h-5 w-5" icon="material-symbols:analytics"/>
                Data & Performance
              </CardTitle>
              <CardDescription>Configure how data is fetched and displayed.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <FormField v-slot="{ componentField }" :model-value="preferences.segments" name="segments">
                <FormItem>
                  <Label for="segments">Chart Resolution</Label>
                  <FormControl>
                    <Input
                        id="segments"
                        max="1000"
                        min="1"
                        placeholder="100"
                        type="number"
                        v-bind="componentField"
                    />
                  </FormControl>
                  <FormDescription>
                    Number of data points to display in historical charts. Higher values show more detail but may impact
                    performance.
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              </FormField>
            </CardContent>
          </Card>

          <!-- Action Buttons -->

          <div class="flex gap-4 sm:justify-end justify-center">
            <Button type="button" variant="outline" @click="navigateTo('/')">
              Cancel
            </Button>
            <Button :disabled="loading" type="submit">
              <Icon v-if="loading" class="h-4 w-4 mr-2 animate-spin" icon="material-symbols:progress-activity"/>
              <Icon v-else class="h-4 w-4 mr-2" icon="material-symbols:save"/>
              {{ loading ? 'Saving...' : 'Save Settings' }}
            </Button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>