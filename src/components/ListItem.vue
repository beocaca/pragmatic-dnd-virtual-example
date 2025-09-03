<template>
  <div
    ref="element"
    :data-item-index="index"
    :class="[
      'm-2 p-4 border border-gray-300 rounded-lg bg-white cursor-grab transition-all duration-200 hover:shadow-md hover:border-gray-400',
      stateClasses[state]
    ]"
    :style="{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: `${virtualItem.size}px`,
      transform: `translateY(${virtualItem.start}px)`
    }"
  >
    <div class="flex items-center justify-between">
      <span class="text-gray-800 font-medium">{{ item.label }}</span>
      <div class="flex space-x-1">
        <div class="w-1 h-4 bg-gray-300 rounded"></div>
        <div class="w-1 h-4 bg-gray-300 rounded"></div>
        <div class="w-1 h-4 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { getItemData, isItemData, type Item } from '../types/list-data'
import type { VirtualItem } from '@tanstack/vue-virtual'

type DragState = 'idle' | 'is-dragging' | 'is-dragging-over'

const stateClasses: Record<DragState, string> = {
  idle: '',
  'is-dragging': 'opacity-40 scale-95',
  'is-dragging-over': 'bg-blue-50 border-blue-300 shadow-lg'
}

const props = defineProps<{
  item: Item
  index: number
  virtualItem: VirtualItem
}>()

const element = ref<HTMLElement>()
const state = ref<DragState>('idle')

let cleanup: (() => void) | undefined

onMounted(() => {
  if (!element.value) return

  cleanup = combine(
    draggable({
      element: element.value,
      getInitialData: () => getItemData(props.index),
      onDragStart: () => {
        state.value = 'is-dragging'
      },
      onDrop: () => {
        state.value = 'idle'
      }
    }),
    dropTargetForElements({
      element: element.value,
      canDrop: ({ source }) => {
        if (source.element === element.value) {
          return false
        }
        return isItemData(source.data)
      },
      getData: () => getItemData(props.index),
      onDragEnter: () => {
        if (state.value !== 'is-dragging') {
          state.value = 'is-dragging-over'
        }
      },
      onDragLeave: () => {
        if (state.value !== 'is-dragging') {
          state.value = 'idle'
        }
      },
      onDrop: () => {
        state.value = 'idle'
      }
    })
  )
})

onUnmounted(() => {
  cleanup?.()
})
</script>