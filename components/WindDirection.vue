<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <div class="flex items-center justify-center origin-bottom relative min-h-28">
          <svg class="absolute" height="150" width="150" xmlns="http://www.w3.org/2000/svg">
            <circle class="stroke-current" cx="75" cy="75" fill="none" r="50" stroke-width="2"/>
            <!-- Tick marks -->
            <g stroke="black" stroke-width="2">
              <line class="stroke-current" transform="rotate(0, 75, 75)" x1="75" x2="75" y1="25" y2="30" stroke-linecap="round"/>
              <line class="stroke-current" transform="rotate(45, 75, 75)" x1="75" x2="75" y1="25" y2="30" stroke-linecap="round"/>
              <line class="stroke-current" transform="rotate(90, 75, 75)" x1="75" x2="75" y1="25" y2="30" stroke-linecap="round"/>
              <line class="stroke-current" transform="rotate(135, 75, 75)" x1="75" x2="75" y1="25" y2="30" stroke-linecap="round"/>
              <line class="stroke-current" transform="rotate(180, 75, 75)" x1="75" x2="75" y1="25" y2="30" stroke-linecap="round"/>
              <line class="stroke-current" transform="rotate(225, 75, 75)" x1="75" x2="75" y1="25" y2="30" stroke-linecap="round"/>
              <line class="stroke-current" transform="rotate(270, 75, 75)" x1="75" x2="75" y1="25" y2="30" stroke-linecap="round"/>
              <line class="stroke-current" transform="rotate(315, 75, 75)" x1="75" x2="75" y1="25" y2="30" stroke-linecap="round"/>
            </g>
          </svg>

          <svg :style="arrowStyle" class="absolute" height="150" width="150" xmlns="http://www.w3.org/2000/svg">
            <path class="stroke-amber-500" d="m75.00001,1.5l10.07874,17.12599l-20.15749,0l10.07874,-17.12599l0.00001,0z"
                  stroke-linejoin="round" fill="none" stroke-width="3"/>
          </svg>
          <span class="text-4xl flex flex-col">
      {{ speed }}
      <span class="text-sm italic font-light">
        mph
       </span>
    </span>
        </div>
      </TooltipTrigger>
      <TooltipContent align="center" side="bottom">
        <span class="text-2xl">{{ angle }}°</span>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
  <p class="hidden">{{rerender}}</p>
</template>

<script>
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "~/components/ui/tooltip/";

export default {
  components: {TooltipContent, TooltipTrigger, TooltipProvider, Tooltip},
  props: {
    angle: {
      type: Number
    },
    speed: {
      type: Number,
    },
    rerender: {
      type: Number
    }
  },
  computed: {
    arrowStyle() {
      return {
        transform: `rotate(${this.angle}deg)`,
      };
    }
  }
};
</script>

<style scoped>
</style>
