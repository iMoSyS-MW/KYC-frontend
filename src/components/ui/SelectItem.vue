<script setup lang="ts">
import { computed } from 'vue'
import { SelectItem, SelectItemText, SelectItemIndicator } from 'reka-ui'
import { Check } from '@lucide/vue'
import { cn } from '@/lib/utils'
import type { SelectItemProps } from './types'

const props = defineProps<SelectItemProps>()

const mergedClass = computed(() =>
  cn(
    'group relative flex w-full cursor-pointer select-none items-center justify-between gap-2 rounded-md py-2.5 pl-2 pr-2 text-sm text-gray-700 outline-none transition-colors data-[highlighted]:bg-gray-50 data-[state=checked]:bg-om-green/10 data-[state=checked]:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    props.class,
  ),
)
</script>

<template>
  <SelectItem :value="value" :class="mergedClass" :disabled="disabled" :text-value="textValue">
    <span class="flex items-center gap-2.5">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 shrink-0 text-gray-300 group-data-[state=checked]:text-om-green"
      >
        <mask
          id="mask0_101_896"
          :style="{ maskType: 'alpha' }"
          maskUnits="userSpaceOnUse"
          x="-1"
          y="-1"
          width="25"
          height="25"
        >
          <rect x="-0.251953" y="-0.351562" width="24" height="24" fill="#E6E6E6" />
        </mask>
        <g mask="url(#mask0_101_896)">
          <path
            d="M4.74805 18.6484V20.6484C4.19805 20.6484 3.72721 20.4526 3.33555 20.0609C2.94388 19.6693 2.74805 19.1984 2.74805 18.6484H4.74805ZM2.74805 16.6484V14.6484H4.74805V16.6484H2.74805ZM2.74805 12.6484V10.6484H4.74805V12.6484H2.74805ZM2.74805 8.64844V6.64844H4.74805V8.64844H2.74805ZM4.74805 4.64844H2.74805C2.74805 4.09844 2.94388 3.6276 3.33555 3.23594C3.72721 2.84427 4.19805 2.64844 4.74805 2.64844V4.64844ZM6.74805 20.6484V18.6484H8.74805V20.6484H6.74805ZM6.74805 4.64844V2.64844H8.74805V4.64844H6.74805ZM10.748 20.6484V18.6484H12.748V20.6484H10.748ZM10.748 4.64844V2.64844H12.748V4.64844H10.748ZM14.748 20.6484V18.6484H16.748V20.6484H14.748ZM14.748 4.64844V2.64844H16.748V4.64844H14.748ZM18.748 18.6484H20.748C20.748 19.1984 20.5522 19.6693 20.1605 20.0609C19.7689 20.4526 19.298 20.6484 18.748 20.6484V18.6484ZM18.748 16.6484V14.6484H20.748V16.6484H18.748ZM18.748 12.6484V10.6484H20.748V12.6484H18.748ZM18.748 8.64844V6.64844H20.748V8.64844H18.748ZM18.748 4.64844V2.64844C19.298 2.64844 19.7689 2.84427 20.1605 3.23594C20.5522 3.6276 20.748 4.09844 20.748 4.64844H18.748Z"
            fill="currentColor"
          />
        </g>
      </svg>
      <SelectItemText>
        <slot />
      </SelectItemText>
    </span>
    <SelectItemIndicator>
      <Check class="h-4 w-4 shrink-0 text-om-green" />
    </SelectItemIndicator>
  </SelectItem>
</template>
