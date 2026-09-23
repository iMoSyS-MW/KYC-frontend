<script setup lang="ts">
// TODO(phase 6): port src/components/KycIndividualUpdate.tsx (1,057 LOC).
// Token-based update flow. The MUI Stepper/Radio/Alert must be rewritten using
// Tailwind + Reka UI — this is the single largest port in the migration.
defineProps<{ token: string }>()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background">
    <p class="text-sm text-muted-foreground">
      Update Individual KYC — arrives in phase 6 (token: {{ token }})
    </p>
  </div>
</template>
