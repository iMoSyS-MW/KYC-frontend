<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Header from './components/Header.vue'
import ConfirmationDialog from './components/ConfirmationDialog.vue'
import { useConfirm } from './composables/useConfirm'
import { getPageTitle } from './lib/pageTitle'

const route = useRoute()
const { state, close } = useConfirm()

const pageTitle = computed(() => getPageTitle(route.path))
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f5]">
    <Header :title="pageTitle" />
    <RouterView />
  </div>
  <ConfirmationDialog
    :open="state.open"
    :title="state.title"
    :message="state.message"
    :confirm-label="state.confirmLabel"
    :cancel-label="state.cancelLabel"
    :tone="state.tone"
    :hide-cancel="state.hideCancel"
    @confirm="close(true)"
    @cancel="close(false)"
  />
</template>
