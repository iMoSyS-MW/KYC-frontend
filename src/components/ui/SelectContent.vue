<script setup lang="ts">
import { computed, defineComponent, onMounted, ref, useSlots, isVNode } from 'vue'
import type { PropType, VNodeChild, VNode } from 'vue'
import { SelectContent, SelectViewport } from 'reka-ui'
import { Search } from '@lucide/vue'
import { cn } from '@/lib/utils'
import type { SelectContentProps } from './types'

const RenderVNodes = defineComponent({
  props: {
    vnodes: {
      type: Array as PropType<VNodeChild[]>,
      required: true,
    },
  },
  setup(props) {
    return () => props.vnodes
  },
})

const props = withDefaults(defineProps<SelectContentProps>(), {
  position: 'popper',
  searchable: true,
  searchPlaceholder: 'Type to search...',
})

const slots = useSlots()
const query = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  searchInput.value?.focus()
})

const mergedClass = computed(() =>
  cn(
    'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
    props.position === 'popper' &&
      'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
    props.class,
  ),
)

const viewportClass = computed(() =>
  cn(
    'p-1',
    props.position === 'popper' &&
      'h-[var(--reka-select-trigger-height)] w-full min-w-[var(--reka-select-trigger-width)]',
  ),
)

function vnodeText(node: VNodeChild): string {
  if (node == null || typeof node === 'boolean') return ''
  if (Array.isArray(node)) return node.map(vnodeText).join('')
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  const vnode = node as VNode
  if (typeof vnode.children === 'string') return vnode.children
  if (Array.isArray(vnode.children)) return vnode.children.map(vnodeText).join('')
  const slotChildren = vnode.children as { default?: (...args: unknown[]) => VNodeChild } | null
  if (slotChildren && typeof slotChildren === 'object' && typeof slotChildren.default === 'function') {
    return vnodeText(slotChildren.default())
  }
  return ''
}

const filteredChildren = computed(() => {
  const children = slots.default?.() ?? []
  if (!props.searchable || !query.value.trim()) return children
  const q = query.value.trim().toLowerCase()
  return children.filter((child) => {
    if (!isVNode(child)) return true
    return vnodeText(child).toLowerCase().includes(q)
  })
})

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') event.stopPropagation()
}
</script>

<template>
  <SelectContent :class="mergedClass" :position="position">
    <div v-if="searchable" class="sticky top-0 z-10 bg-popover p-2">
      <div class="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
        <Search class="h-4 w-4 shrink-0 text-gray-400" />
        <input
          ref="searchInput"
          :value="query"
          :placeholder="searchPlaceholder"
          class="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          @input="query = ($event.target as HTMLInputElement).value"
          @keydown="onSearchKeydown"
        />
      </div>
    </div>
    <SelectViewport :class="viewportClass">
      <RenderVNodes :vnodes="filteredChildren" />
    </SelectViewport>
  </SelectContent>
</template>
