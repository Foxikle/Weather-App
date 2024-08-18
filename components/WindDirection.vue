<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <div class="flex items-center justify-center origin-bottom relative min-h-28">
          <svg class="absolute" height="150" width="150" xmlns="http://www.w3.org/2000/svg">
            <circle class="stroke-current" cx="75" cy="75" fill="none" r="50" stroke-width="2"/>
            <!-- Tick marks -->
            <g stroke="black" stroke-width="2">
              <line class="stroke-current" stroke-linecap="round" transform="rotate(0, 75, 75)" x1="75" x2="75" y1="25"
                    y2="30"/>
              <line class="stroke-current" stroke-linecap="round" transform="rotate(45, 75, 75)" x1="75" x2="75" y1="25"
                    y2="30"/>
              <line class="stroke-current" stroke-linecap="round" transform="rotate(90, 75, 75)" x1="75" x2="75" y1="25"
                    y2="30"/>
              <line class="stroke-current" stroke-linecap="round" transform="rotate(135, 75, 75)" x1="75" x2="75" y1="25"
                    y2="30"/>
              <line class="stroke-current" stroke-linecap="round" transform="rotate(180, 75, 75)" x1="75" x2="75" y1="25"
                    y2="30"/>
              <line class="stroke-current" stroke-linecap="round" transform="rotate(225, 75, 75)" x1="75" x2="75" y1="25"
                    y2="30"/>
              <line class="stroke-current" stroke-linecap="round" transform="rotate(270, 75, 75)" x1="75" x2="75" y1="25"
                    y2="30"/>
              <line class="stroke-current" stroke-linecap="round" transform="rotate(315, 75, 75)" x1="75" x2="75" y1="25"
                    y2="30"/>
            </g>
          </svg>

          <svg :style="arrowStyle" class="absolute" height="150" width="150" xmlns="http://www.w3.org/2000/svg">
            <path class="stroke-amber-500" d="m75.00001,1.5l10.07874,17.12599l-20.15749,0l10.07874,-17.12599l0.00001,0z"
                  fill="none" stroke-linejoin="round" stroke-width="3"/>
          </svg>
          <span class="text-4xl flex flex-col">
      {{ speed }}
      <span class="text-sm italic font-light">
        {{ toAbbreviation(preferences.speed) }}
       </span>
    </span>
        </div>
      </TooltipTrigger>
      <TooltipContent align="center" side="bottom">
        <span class="text-2xl">{{
            convertAngle(angle, preferences.angle)
          }}{{ toAbbreviation(preferences.angle) }}</span>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
  <p class="hidden">{{ rerender }}</p>
</template>

<script lang="ts" setup>
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "~/components/ui/tooltip/";
import {convertAngle, toAbbreviation} from "@/lib/utils";
import useUserPrefs from "~/composables/useUserPrefs";


const {preferences} = useUserPrefs()

const props = defineProps({
  angle: Number,
  speed: String,
  rerender: Number,
});

watch(props, (newValue) => {
  arrowStyle.value.transform = `rotate(${newValue.angle}deg)`
})

console.log(props.angle)
const arrowStyle = ref({
  transform: `rotate(${props.angle}deg)`,
})


</script>

