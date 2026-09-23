<script setup lang="ts">
const logoSrc = '/Logo banner.png'

withDefaults(defineProps<{ title: string }>(), {
  title: '',
})
</script>

<template>
  <div class="sticky top-0 z-[1100]">
    <div class="bg-black py-2 text-center">
      <p class="text-white text-[0.85rem]">
        To speak to a financial adviser, call us:
        <span class="text-[#B9E2B6] font-bold text-[0.85rem]">0860 66 66 59</span>
      </p>
    </div>

    <div class="bg-white border-b border-[#e1e5e9] px-4 sm:px-6 md:px-8">
      <div class="max-w-6xl mx-auto flex items-center gap-3">
        <div class="flex items-center flex-shrink-0 overflow-hidden">
          <img
            :src="logoSrc"
            alt="Old Mutual"
            class="h-[50px] w-auto object-contain"
          />
        </div>

        <h2 class="font-bold text-om-dark text-base sm:text-lg font-montserrat">
          {{ title }}
        </h2>
      </div>
    </div>
  </div>
</template>
