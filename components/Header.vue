<script lang="ts" setup>

import {NavigationMenu, navigationMenuTriggerStyle} from "~/components/ui/navigation-menu";
import {Icon} from "@iconify/vue";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "~/components/ui/dropdown-menu";
import {toTypedSchema} from "@vee-validate/zod";
import {z} from "zod";
import {useForm} from "vee-validate";
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
  speed: z.string(),
  segments: z.number()
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


      <NuxtLink as-child to="/settings">
        <Button as-child variant="ghost" @click="loadPreferences">
          <div>
            <Icon class="h-5 w-5" icon="mdi:gear"/>
          </div>
        </Button>
      </NuxtLink>
    </div>
  </Card>
</template>

<style scoped>

</style>