<script setup lang="ts">
// TODO(phase 6): port src/components/KycGroupUpdate.tsx (599 LOC).
// Token-based update flow. MUI Stepper/Radio/Alert -> Tailwind + Reka UI.
defineProps<{ token: string }>()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background">
    <p class="text-sm text-muted-foreground">
      Update Group KYC — arrives in phase 6 (token: {{ token }})
    </p>
  </div>
</template>
