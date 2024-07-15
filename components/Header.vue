<script lang="ts" setup>

import {NavigationMenu, navigationMenuTriggerStyle} from "~/components/ui/navigation-menu";
import {Icon} from "@iconify/vue";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "~/components/ui/dropdown-menu";


const colorMode = useColorMode()
</script>

<template>
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
        <NuxtLink to="https://github.com/foxikle/weather-app" target="_blank" no-prefetch no-rel>
          <Icon class="h-5 w-5" icon="mdi:github"/>
        </NuxtLink>
      </Button>
    </div>
  </Card>
</template>

<style scoped>

</style>